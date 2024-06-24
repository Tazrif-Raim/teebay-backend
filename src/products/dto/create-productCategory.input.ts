import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

// @InputType()
// export class CreateProductCategoryInput {
//   @Field()
//   product_id?: number;

//   @Field()
//   category_name: string;
// }

@InputType()
export class CreateProductCategoryInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  category_name: string;
}