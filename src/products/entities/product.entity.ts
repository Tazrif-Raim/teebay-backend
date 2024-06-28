import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { ProductStatus } from './product-status.enum';
import { ProductCategory } from './product-category.entity';
import { User } from '../../Auth/entities/user.entity';
import { Booking } from './booking.entity';

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
  sell_date?: Date;

  @Field(type => User)
  uploaded_by?: User;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(type => User, { nullable: true })
  received_by?: User;

  @Field(type => [ProductCategory])
  categories: ProductCategory[];

  @Field(type => [Booking])
  bookings: Booking[];
}

