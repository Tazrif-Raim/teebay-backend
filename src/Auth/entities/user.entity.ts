import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Role } from '@prisma/client';

@ObjectType()
export class User {
    @Field(() => Int)
    id?: number;
    
    @Field()
    email: string;

    @Field()
    password: string;

    @Field()
    firstname: string;

    @Field()
    lastname: string;

    @Field()
    access: Role;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}