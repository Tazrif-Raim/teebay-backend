import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { AuthService } from 'src/Auth/auth.service';
import { Booking } from 'src/products/entities/booking.entity';
import { UseGuards } from '@nestjs/common';
import { UserSessionGuard } from 'src/Auth/guards/user-session.guard';
import { UserRelatedProducts } from './entities/UserRelatedProducts.entity';

@Resolver(() => Product)
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService,
    private readonly authService: AuthService
  ) {}

  @UseGuards(UserSessionGuard)
  @Mutation(() => Product)
  async createProduct(@Args('createProductInput') createProductInput: CreateProductInput, @Context() context): Promise<Product> {
    try {
      const email = context.req.user.email;
      return this.productsService.createProduct(createProductInput, email);
    }
    catch(e){
      console.log(e);
      return null;
    }
    
  }

  @UseGuards(UserSessionGuard)
  @Query(() => [Product])
  async findAllProductOfUser(@Context() context): Promise<Product[] | null> {
    try{
      const email = context.req.user.email;
      return await this.productsService.findAllProductOfUser(email);
    }
    catch(e){
      console.log(e);
      return null;
    }
  }

  @UseGuards(UserSessionGuard)
  @Query(() => UserRelatedProducts)
  async findAllProductRelatedToUser(@Context() context): Promise<UserRelatedProducts | null> {
    try{
      const email = context.req.user.email;
      const borrowed = await this.productsService.findUserBorrowedProduct(email);
      const lent = await this.productsService.findUserLentProduct(email);
      const bought = await this.productsService.findUserBoughtProduct(email);
      const sold = await this.productsService.findUserSoldProduct(email);
      return {
        borrowed,
        lent,
        bought,
        sold
      };
    }
    catch(e){
      console.log(e);
      return null;
    }
  }

  @UseGuards(UserSessionGuard)
  @Query(() => [Product])
  async findAllAvailableProduct(@Context() context): Promise<Product[] | null> {
    try {
      const email = context.req.user.email;
      return await this.productsService.findAllAvailableProduct(email);
    }
    catch(e){
      console.log(e);
      return null;
    }
  }

  @UseGuards(UserSessionGuard)
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

  @UseGuards(UserSessionGuard)
  @Mutation(() => Product || null)
  async updateProduct(@Args('updateProductInput') updateProductInput: UpdateProductInput, @Context() context) : Promise<Product | null>{
    try {
      const email = context.req.user.email;
      return await this.productsService.update(updateProductInput, email);
    }
    catch(e){
      console.log(e);
      return null;
    }
  }

  @UseGuards(UserSessionGuard)
  @Mutation(() => Boolean)
  async removeProduct(@Args('id', { type: () => Int }) id: number, @Context() context) : Promise<Boolean> {
    try{
      const email = context.req.user.email;
      return await this.productsService.remove(id, email);
    }
    catch(e){
      console.log(e);
      return false;
    }
  }

  @UseGuards(UserSessionGuard)
  @Mutation(() => Product)
  async buyProduct(@Args('product_id', { type: () => Int }) product_id: number, @Args('action') action: 'sell', @Context() context) : Promise<Boolean> {
    try{
      const email = context.req.user.email;
      return await this.productsService.buyProduct(product_id, action, email);
    }
    catch(e){
      console.log(e);
      return false;
    }
  }

  @UseGuards(UserSessionGuard)
  @Mutation(() => Boolean)
  async rentProduct(@Args('product_id', { type: () => Int }) product_id: number, 
                    @Args('action') action: 'rent', 
                    @Args('start_date') start_date:Date, 
                    @Args('end_date') end_date:Date,
                    @Context() context
                  ) : Promise<Boolean> {
    try{
      const email = context.req.user.email;
      return await this.productsService.rentProduct(product_id, action,start_date, end_date, email);
    }
    catch(e){
      console.log(e);
      return false;
    }
  }

  //this should return a list of list of start_date and end_date
  @UseGuards(UserSessionGuard)
  @Query(() => [Booking])
  async findFutureBookingsByProductId(@Args('product_id', { type: () => Int }) product_id:number): Promise<Booking[] | null> {
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
