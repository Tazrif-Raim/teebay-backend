import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { create } from 'domain';
import { AuthService } from 'src/Auth/auth.service';
import { Booking } from 'src/products/entities/booking.entity';

@Resolver(() => Product)
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService,
    private readonly authService: AuthService
  ) {}

  eemail: string = "raim@gmail.com";

  @Mutation(() => Product)
  async createProduct(@Args('createProductInput') createProductInput: CreateProductInput): Promise<Product> {
    try {
      //createProductInput.uploaded_by = await this.authService.findUserByEmail(this.eemail);
      return this.productsService.createProduct(createProductInput);
    }
    catch(e){
      console.log(e);
      return null;
    }
    
  }

  @Query(() => [Product])
  async findAllProductOfUser(): Promise<Product[] | null> {
    try{
      return await this.productsService.findAllProductOfUser(this.eemail);
    }
    catch(e){
      console.log(e);
      return null;
    }
  }

  @Query(() => [Product])
  async findAllProductRelatedToUser(): Promise<Product[] | null> {
    try{
      return await this.productsService.findAllProductRelatedToUser(this.eemail);
    }
    catch(e){
      console.log(e);
      return null;
    }
  }

  @Query(() => [Product])
  async findAllAvailableProduct(): Promise<Product[] | null> {
    try {
      return await this.productsService.findAllAvailableProduct();
    }
    catch(e){
      console.log(e);
      return null;
    }
  }

  @Query(() => Product)
  async findOneProduct(@Args('id', { type: () => Int }) id: number): Promise<Product | null>{
    try {
      return await this.productsService.findOneProduct(id);
    }
    catch(e){
      console.log(e);
      return null;
    }
  }

  @Mutation(() => Product)
  async updateProduct(@Args('updateProductInput') updateProductInput: UpdateProductInput) {
    try {
      return await this.productsService.update(updateProductInput);
    }
    catch(e){
      console.log(e);
      return null;
    }
  }

  @Mutation(() => Product)
  async removeProduct(@Args('id', { type: () => Int }) id: number) : Promise<Boolean> {
    try{
      return await this.productsService.remove(id);
    }
    catch(e){
      console.log(e);
      return false;
    }
  }

  @Mutation(() => Product)
  async buyProduct(@Args('product_id', { type: () => Int }) product_id: number, @Args('action') action: 'sell') : Promise<Boolean> {
    try{
      return await this.productsService.buyProduct(product_id, action, this.eemail);
    }
    catch(e){
      console.log(e);
      return false;
    }
  }

  @Mutation(() => Product)
  async rentProduct(@Args('product_id', { type: () => Int }) product_id: number, @Args('action') action: 'rent', @Args('start_date') start_date:Date, @Args('end_date') end_date:Date) : Promise<Boolean> {
    try{
      return await this.productsService.rentProduct(product_id, action,start_date, end_date, this.eemail);
    }
    catch(e){
      console.log(e);
      return false;
    }
  }

  //this should return a list of list of start_date and end_date
  @Query(() => [Booking])
  async findFutureBookingsByProductId(@Args('product_id') product_id:number): Promise<Booking[] | null> {
    try{
      const bookings = await this.productsService.findFutureBookingsByProductId(product_id);
      const start_end_date = [];
      for(let booking of bookings){
        start_end_date.push({start_date: booking.start_date, end_date: booking.end_date});
      }
      return start_end_date;
    }
    catch(e){
      console.log(e);
      return null;
    }
  } 

}
