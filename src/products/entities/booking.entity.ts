import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Product } from './product.entity';
import { User } from '../../Auth/entities/user.entity';

@ObjectType()
export class Booking {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  user_id: number;

  @Field(() => Int)
  product_id: number;

  @Field()
  start_date: Date;

  @Field()
  end_date: Date;

  @Field(() => User)
  user: User;

  @Field(() => Product)
  product: Product;
}