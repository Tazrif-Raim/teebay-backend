import { Injectable, Query } from '@nestjs/common';
import { Mutation } from '@nestjs/graphql';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { Role } from '@prisma/client';
import { UpdateUserInput } from './dto/update-user.input';


@Injectable()
export class AuthService {
    constructor(private readonly db:PrismaService) {}

    async registerUser(data: User): Promise<UpdateUserInput> {
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
            return null;
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
}