import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { AuthService } from './auth.service';
import { CreateUserInput } from './dto/create-user.input';
import { LoginInput } from './dto/login.input';
import { Session } from '@nestjs/common';
import { Role } from './entities/role.enum';
import session from 'express-session';
import { UpdateUserInput } from './dto/update-user.input';
 

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

    @Query(returns => Boolean)
    async login(@Args('LoginInput') loginInput: LoginInput) : Promise<boolean>{
        let user: User;
        try{
            user = await this.authService.findUserByEmail(loginInput.email);
        }
        catch(e) {
            console.log(e);
            return false;
        }
        
        if(user && user.password === loginInput.password) {
            //session.email = user.email;
            //console.log(session.id);
            return true;
        } else {
            return false;
        }
    }
}