import { ObjectType, Field } from '@nestjs/graphql';
import { ProductCategory } from './product-category.entity';

@ObjectType()
export class Category {
  @Field()
  name: string;

  @Field(() => [ProductCategory])
  products: ProductCategory[];
}