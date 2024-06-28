import { Field, ObjectType } from "@nestjs/graphql";
import { Product } from "./product.entity";

@ObjectType()
export class UserRelatedProducts {
    @Field(() => [Product])
    borrowed: Product[];

    @Field(() => [Product])
    lent: Product[];

    @Field(() => [Product])
    bought: Product[];

    @Field(() => [Product])
    sold: Product[];
}