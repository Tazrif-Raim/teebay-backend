import { InputType, Int, Field, Float } from '@nestjs/graphql';
import { CreateProductCategoryInput } from './create-productCategory.input';
import { ProductStatus } from '../entities/product-status.enum';
import { IsDate, IsIn, IsNotEmpty, IsNumber, IsString, isNumber, IsOptional } from 'class-validator';
import { User } from 'src/Auth/entities/user.entity';

// @InputType()
// export class CreateProductInput {
//     @Field()
//     @IsNotEmpty()
//     @IsString()
//     title: string;

//     @Field()
//     @IsNotEmpty()
//     @IsString()
//     description: string;

//     @Field()
//     @IsNotEmpty()
//     @IsNumber()
//     sell_price: number;

//     @Field()
//     @IsNotEmpty()
//     @IsNumber()
//     rent_price_daily: number;

//     //@Field(type => ProductStatus, { defaultValue: ProductStatus.AVAILABLE })
//     //@IsIn([ProductStatus.AVAILABLE, ProductStatus.RENTED, ProductStatus.SOLD])
//     //@IsNotEmpty()
//     status: ProductStatus;

//     //@Field({ nullable: true })
//     //@IsDate()
//     sell_or_rent_time?: Date;

//     //@Field({ nullable: true })
//     //@IsDate()
//     rent_time_end?: Date;

//     //@Field()
//     //@IsNumber()
//     uploaded_by_id?: number;

//     uploaded_by?: User | any;

//     createdAt?: Date;

//     updatedAt?: Date;

//     @Field(type => [CreateProductCategoryInput])
//     categories: CreateProductCategoryInput[];
// }

@InputType()
export class CreateProductInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  title: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  description: string;

  @Field(() => Float)
  @IsNotEmpty()
  @IsNumber()
  sell_price: number;

  @Field(()=> Float)
  @IsNotEmpty()
  @IsNumber()
  rent_price_daily: number;

  @Field(type => [CreateProductCategoryInput])
  @IsNotEmpty()
  categories: CreateProductCategoryInput[];
}

