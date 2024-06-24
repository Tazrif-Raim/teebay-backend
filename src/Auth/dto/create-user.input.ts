import { InputType, Field } from "@nestjs/graphql";
import { IsAlpha, IsEmail, IsIn, IsNotEmpty, IsOptional } from "class-validator";
import { isRegExp } from "util/types";
import { Role } from "../entities/role.enum";

@InputType()
export class CreateUserInput {
    id?: number;
    
    @Field()
    @IsEmail()
    @IsNotEmpty()
    email: string;  

    @Field()
    @IsNotEmpty()
    password: string;

    @Field()
    @IsAlpha()
    @IsNotEmpty()
    firstname: string;

    @Field()
    @IsAlpha()
    @IsNotEmpty()
    lastname: string;

    access: Role | null;

    createdAt: Date | null;

    updatedAt: Date | null;
}