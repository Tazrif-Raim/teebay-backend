import { InputType, Field, PartialType } from "@nestjs/graphql";
import { CreateProductCategoryInput } from "./create-productCategory.input";

@InputType()
export class UpdateProductCategoryInput extends PartialType(CreateProductCategoryInput) {}