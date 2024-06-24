import { IsNotEmpty } from 'class-validator';
import { CreateProductInput } from './create-product.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateProductInput extends CreateProductInput {
  @Field(() => Int)
  @IsNotEmpty()
  id: number;
}
