import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { AuthService } from './auth.service';
import { CreateUserInput } from './dto/create-user.input';
import { LoginInput } from './dto/login.input';
import { Role } from './entities/role.enum';
import { UpdateUserInput } from './dto/update-user.input';
import * as bcrypt from 'bcrypt';

 

@Resolver(() => User)
export class AuthResolver {
    constructor(private readonly authService: AuthService) {}

    @Mutation(() => User)
    async createUser(@Args('createUserInput') createUserInput: CreateUserInput) : Promise<UpdateUserInput> {
        createUserInput.access = Role.USER;
        try{
            return await this.authService.registerUser(createUserInput);
        } 
        catch(e) {
            console.log(e);
            return null;
        }
    }

    @Query(returns => String, { name: 'token' })
    async login(@Args('LoginInput') loginInput: LoginInput) : Promise<string>{
        let user: User;
        try{
            user = await this.authService.findUserByEmail(loginInput.email);
        }
        catch(e) {
            console.log(e);
            return "";
        }
        
        if(user && await bcrypt.compare(loginInput.password, user.password)) {
            return await this.authService.createSession(loginInput.email); //return token
        } else {
            return "";
        }
    }

    @Query(returns => Boolean)
    async logout(@Args('token') token: string) : Promise<boolean>{
        try{
            return await this.authService.deleteSession(token);
        }
        catch(e){
            console.log(e);
            return false;
        }
    }
}