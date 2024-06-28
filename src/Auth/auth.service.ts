import { Injectable, Query } from '@nestjs/common';
import { Mutation } from '@nestjs/graphql';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { Role } from '@prisma/client';
import { UpdateUserInput } from './dto/update-user.input';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import exp from 'constants';


@Injectable()
export class AuthService {
    constructor(private readonly db:PrismaService) {}
    private readonly saltRounds = 14;

    async registerUser(data: User): Promise<UpdateUserInput> {
        data.password = await bcrypt.hash(data.password, await bcrypt.genSalt(this.saltRounds));
        data.createdAt = new Date();
        data.updatedAt = data.createdAt;
        console.log(data)
        try {
            const user:any =  await this.db.user.create({
                data
            })
            user.id = Number(user.id);
            return user;
        }
        catch(e) {
            console.log(e);
            if(e.code === 'P2002') {
                throw new Error("Email already exists");
            }
            throw new Error("Something Went Wrong");
        }
    }

    async hashToken(token: string): Promise<string> {
        return await crypto.createHash('sha256').update(token).digest('hex');
    }

    async generateToken(): Promise<string> {
        return await crypto.randomBytes(32).toString('hex');
    }

    // model User {
    //     id        BigInt      @id @default(autoincrement())
    //     email     String      @unique
    //     password  String
    //     firstname String
    //     lastname  String
    //     access    Role        @default(USER)
    //     createdAt DateTime    @default(now())
    //     updatedAt DateTime    @updatedAt
    //     products  Product[]  @relation("uploaded_by")
    //     received_products Product[] @relation("received_by") 
    //     bookings Booking[] @relation("user_bookings")
    //     sessions  Session[]
    //   }
      
    //   model Session {
    //     id        BigInt   @id @default(autoincrement())
    //     token     String   @unique
    //     email     String
    //     userId    BigInt
    //     user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
    //     createdAt DateTime @default(now())
    //     expiry    DateTime
    //   }

    async createSession(email: string): Promise<string> {
        const rawToken = await this.generateToken();
        const token = await this.hashToken(rawToken);
        try {
            await this.db.session.create({
                data: {
                    token,
                    email,
                    expiry: new Date(Date.now() + 1000*60*60*24), // 24 hours
                    user: {
                        connect: {
                            email
                        }
                    },
                }
            })
            return rawToken;
        } 
        catch(e) {
            console.log(e);
            return "";
        }
    }

    async deleteSession(rawToken: string): Promise<boolean> {
        try {
            const token = await this.hashToken(rawToken);
            await this.db.session.delete({
                where: {
                    token
                }
            })
            return true;
        }
        catch(e) {
            console.log(e);
            return false;
        }
    }

    async findUserByEmail(email: string): Promise<UpdateUserInput | null> {
        try {
            const user:any =  await this.db.user.findUnique({
                where: {
                    email
                }
            })
            user.id = Number(user.id);
            return user;
        }
        catch(e) {
            console.log(e);
            return null;
        }
        
    }

    async getUserEmailByToken(rawToken: string): Promise<string | null> {
        try {
            const token = await this.hashToken(rawToken);
            const session = await this.db.session.findUnique({
                where: {
                    token
                }
            })
            return session.email;
        }
        catch(e) {
            console.log(e);
            return null;
        }
    }
}