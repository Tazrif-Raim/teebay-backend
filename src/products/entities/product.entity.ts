import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { ProductStatus } from './product-status.enum';
import { ProductCategory } from './product-category.entity';
import { User } from '../../Auth/entities/user.entity';

@ObjectType()
export class Product {
  @Field(() => Int)
  id?: number;
  
  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  sell_price: number;

  @Field()
  rent_price_daily: number;

  @Field(type => ProductStatus)
  status: ProductStatus;

  @Field({ nullable: true })
  sell_or_rent_time?: Date;

  @Field({ nullable: true })
  rent_time_end?: Date;

  @Field(type => User)
  uploaded_by?: User;

  @Field()
  uploaded_by_id: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(type => User, { nullable: true })
  received_by?: User;

  @Field({ nullable: true })
  received_by_id?: number;

  @Field(type => [ProductCategory])
  categories: ProductCategory[];
}

