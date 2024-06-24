import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Product } from './product.entity';
import { Category } from './category.entity';   

@ObjectType()
export class ProductCategory {
  @Field(() => Int)
  product_id: number;

  @Field()
  category_name: string;

  @Field(() => Product)
  product: Product;

  @Field(() => Category)
  category: Category;
}