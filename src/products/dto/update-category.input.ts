import { Field, InputType, PartialType, Int } from "@nestjs/graphql";
import { CreateCategoryInput } from "./create-category.input";

@InputType()    
export class UpdateCategoryInput extends PartialType(CreateCategoryInput) {}