import { Field, InputType, Int } from "@nestjs/graphql";
import { CreateUserInput } from "./create-user.input";

@InputType()
export class UpdateUserInput extends CreateUserInput {
    @Field(() => Int)
    id?: number | null;
}