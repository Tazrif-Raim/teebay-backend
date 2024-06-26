import { ConflictException, Injectable } from '@nestjs/common';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { Product } from './entities/product.entity';
import { ProductStatus } from './entities/product-status.enum';
import * as cron from 'node-cron';
import { UserRelatedProducts } from './entities/UserRelatedProducts.entity';
import { Booking } from '@prisma/client';
import { ProductCategory } from './entities/product-category.entity';

@Injectable()
export class ProductsService {
  constructor(private readonly db: PrismaService) {}

  async createProduct(rawProductData: CreateProductInput, email: string): Promise<Product> {
    //productData.status = ProductStatus.AVAILABLE;
    //productData.createdAt = new Date();
    //productData.updatedAt = productData.createdAt;
    //productData.uploaded_by_id = productData.uploaded_by.id;
    const { categories, ...productData } = rawProductData;
    try{
      const user:any = await this.db.user.findUnique({
        where: {
          email: email
        }
      });
      const uploaded_by_id:any = user.id;
      const product:any = await this.db.product.create({
        data: {
          ...productData,
          status: ProductStatus.AVAILABLE,
          uploaded_by: uploaded_by_id ? { connect: { id: uploaded_by_id } } : undefined,
          categories: {
            create: categories.map(category => ({ 
              category: {
                connectOrCreate: {
                  where: { name: category.category_name },
                  create: { name: category.category_name }
                }
              }
            })),
          },
        },
        include: {
          categories: true,
          uploaded_by: true
        }
      });
      product.id = Number(product.id);
      product.uploaded_by.password = '';
      return product;
      
    }
    catch(e){
      console.log(e);
      return null;
    }
  }

  async findAllProductOfUser(email: string) : Promise<Product[] | null> {
    try{
      const user:any = await this.db.user.findUnique({
        where: {
          email: email
        }
      });
      const uploaded_by_id:any = user.id;
      const products:any = await this.db.product.findMany({
        where: {
          uploaded_by_id: uploaded_by_id,
          status: {
            in: [ProductStatus.AVAILABLE, ProductStatus.RENTED],
          }
        },
        include: {
          categories: true,
          uploaded_by: true,
          received_by: true,
        }
      });
      products.forEach((product:any) => {
        product.id = Number(product.id);
        product.uploaded_by.password = '';
        if(product.received_by) product.received_by.password = '';
      });
      return products;
    }
    catch(e){
      console.log(e);
      return null;
    }
  }

  async findAllAvailableProduct(email: string) : Promise<Product[] | null> {
    try{
      const user:any = await this.db.user.findUnique({
        where: {
          email: email
        }
      });
      const products:any = await this.db.product.findMany({
        where: {
          uploaded_by_id: {
            not: {
              equals: user.id
            }
          },
          status: {
            in: [ProductStatus.AVAILABLE, ProductStatus.RENTED],
          }
        },
        include: {
          categories: true,
          uploaded_by: true
        }
      });
      products.forEach((product:any) => {
        product.id = Number(product.id);
      });
      return products;
    }
    catch(e){
      console.log(e);
      return null;
    }
  }

  async findUserBoughtProduct(email: string) : Promise<Product[] | null> {
    try{
      const user:any = await this.db.user.findUnique({
        where: {
          email: email
        }
      });
      const products:any = await this.db.product.findMany({
        where: {
          received_by_id: user.id,
          status: ProductStatus.SOLD
        },
        include: {
          categories: true,
          uploaded_by: true,
          received_by: true,
        }
      });
      products.forEach((product:any) => {
        product.id = Number(product.id);
        product.uploaded_by.password = '';
        if(product.received_by) product.received_by.password = '';
      });
      return products;
    }
    catch(e){
      console.log(e);
      return null;
    }
  }

  async findUserBorrowedProduct(email: string) : Promise<Product[] | null> {
    try{
      const user:any = await this.db.user.findUnique({
        where: {
          email: email
        }
      });
      const bookings:any = await this.db.booking.findMany({
        where: {
          user_id: user.id,
          end_date: {
            gt: new Date(),
          },
          start_date: {
            lt: new Date(),
          },
        },
        include: {
          product: {
            include: {
              categories: true,
              uploaded_by: true,
              received_by: true,
            }
          }
        }
      });
      return bookings.map((booking:any) => {
        const product = booking.product;
        product.id = Number(product.id);
        product.uploaded_by.password = '';
        if(product.received_by) product.received_by.password = '';
        return product;
      });
    }
    catch(e){
      console.log(e);
      return null;
    }
  }

  //expects an array of numbers
  async rightNowRentedProductIds() : Promise<bigint[]> {
    const bookings = await this.db.booking.findMany({
      where: {
        start_date: {
          lt: new Date(),
        },
        end_date: {
          gt: new Date(),
        },
      },
    });
    const productIds = bookings.map(booking => booking.product_id);
    return productIds;
  }

  async findUserSoldProduct(email: string) : Promise<Product[] | null> {
    try{
      const user:any = await this.db.user.findUnique({
        where: {
          email: email
        }
      });
      const products:any = await this.db.product.findMany({
        where: {
          uploaded_by_id: user.id,
          status: ProductStatus.SOLD
        },
        include: {
          categories: true,
          uploaded_by: true,
          received_by: true,
        }
      });
      products.forEach((product:any) => {
        product.id = Number(product.id);
        product.uploaded_by.password = '';
        if(product.received_by) product.received_by.password = '';
      });
      return products;
    }
    catch(e){
      console.log(e);
      return null;
    }
  }

  async findUserLentProduct(email: string) : Promise<Product[] | null> {
    try{
      const user:any = await this.db.user.findUnique({
        where: {
          email: email
        }
      });
      const products:any = await this.db.product.findMany({
        where: {
          uploaded_by_id: user.id,
        },
        include: {
          categories: true,
          uploaded_by: true,
          received_by: true,   
        }
      });
      console.log(products);
      console.log(products.length)
      

      const rentedProductIds = await this.rightNowRentedProductIds();
      console.log(rentedProductIds);
      //only porducts that has the ids in rentedProductIds
      const productsToReturn = products.filter((product:any) => rentedProductIds.includes(product.id));
      productsToReturn.forEach((product:any) => {
        console.log(product.id);
        product.id = Number(product.id);
        console.log(product.id)
        product.uploaded_by.password = '';
        if(product.received_by) product.received_by.password = '';
      });
      
      return productsToReturn;
    }
    catch(e){
      console.log(e);
      return null;
    }
  }

  async findOneProduct(id: number) : Promise<Product> {
    const product:any = await this.db.product.findUnique({
      where: {
        id: id
      },
      include: {
        categories: true,
        uploaded_by: true,
        received_by: true,
      }
    });
    product.id = Number(product.id);
    return product;
  }

  async update(updateProductInput: UpdateProductInput, email: string) : Promise<Product | null> {
    try {
      const { id, categories, ...productData } = updateProductInput;

      const currentProduct:any = await this.db.product.findUnique({
        //status: ProductStatus.AVAILABLE or ProductStatus.RENTED
        where: {
          id: id,
          status: {
            in: [ProductStatus.AVAILABLE, ProductStatus.RENTED]
          }
        },
        include: {
          categories: true,
          uploaded_by: true
        }
      });

      if (!currentProduct) {
        return null;
      }

      if (currentProduct.uploaded_by.email !== email) {
        return null;
      }

      const currentCategoryNames = currentProduct.categories.map(category => category.category_name);
      const newCategoryNames = categories.map(category => category.category_name);

      const categoriesToAdd = newCategoryNames.filter(name => !currentCategoryNames.includes(name));
      const categoriesToRemove = currentCategoryNames.filter(name => !newCategoryNames.includes(name));

      return await this.db.$transaction(async (db) => {
        const product:any = await db.product.update({
          where: { id: id },
          data: {
            ...productData
          },
          include: {
            categories: true,
            uploaded_by: true,
            received_by: true,
          },
        });
  
        await db.productCategory.deleteMany({
          where: {
            product_id: id,
            category_name: {
              in: categoriesToRemove
            }
          }
        });
  
        for (const categoryName of categoriesToAdd) {
          await db.productCategory.create({
            data: {
              product_id: id,
              category_name: categoryName
            }
          });
        }
  
        product.id = Number(product.id);
        return product;
      });
    }
    catch(e){
      console.log(e);
      return null;
    }
  }

  async buyProduct(productId: number, action: 'sell', email: string) : Promise<any> {
    try {
      const user = await this.db.user.findUnique({
        where: { email: email },
        select: {
          id: true,
        },
      });
      const userId = user.id;
      return await this.db.$transaction(async (db) => {
        
        await db.$executeRaw`SET TRANSACTION ISOLATION LEVEL SERIALIZABLE`; //REPEATABLE READ
        // Step 2: Check Availability with Locking
        
        const product = await db.product.findUnique({
          where: { id: productId },
          select: {
            id: true,
            status: true,
          }
        });
  
        if (!product) {
          throw new Error('Product not found');
        }
        console.log(product);
        if (product.status === ProductStatus.SOLD) {
          throw new ConflictException('Product is not available for sell');
        }

        const bookings = await this.findFutureBookingsByProductId(productId);
        let availableAfter = new Date(); 
        if (bookings && bookings.length > 0) {
          availableAfter = bookings[bookings.length - 1].end_date;
        }

        console.log(bookings);
        console.log(availableAfter);
  
        // Step 3: Perform the Action
        const updatedProduct:any = await db.product.update({
          where: { id: productId },
          data: {
            status: ProductStatus.SOLD,
            received_by_id: userId,
            sell_date: availableAfter,
          },
          include: {
            categories: true,
            uploaded_by: true,
            received_by: true,
          },
        });
        updatedProduct.id = Number(updatedProduct.id);
        return updatedProduct;
      });
    }
    catch(e){
      console.log(e);
      return e;
    } 
  }

  async rentProduct(productId: number, action: 'rent', start_date:Date, end_date:Date, email: string) : Promise<Boolean> {
    try{
      const user = await this.db.user.findUnique({
        where: { email: email },
        select: {
          id: true,
        },
      });
      const userId = user.id;
      return await this.db.$transaction(async (db) => {
        await db.$executeRaw`SET TRANSACTION ISOLATION LEVEL REPEATABLE READ`;
        // Step 2: Check Availability with Locking
        const product:any = await db.product.findUnique({
          where: { id: productId },
          select: {
            id: true,
            status: true,
            rent_price_daily: true,
          }
        });
  
        if (!product) {
          throw new Error('Product not found');
        }
  
        if (product.status === ProductStatus.SOLD) {
          throw new ConflictException('Product is not available for rent');
        }

        const bookings = await this.findFutureBookingsByProductId(productId);
        if (bookings && bookings.length > 0) {          
          bookings.forEach((booking:any) => {
            if ((start_date >= booking.start_date && start_date <= booking.end_date) || 
                (end_date >= booking.start_date && end_date <= booking.end_date) ||
                (start_date <= booking.start_date && end_date >= booking.end_date)) {
              throw new ConflictException('Product rent time overlaps with another booking');
            }
          });
        }
  
        // Step 3: Perform the Action
        const createBooking:any = await db.booking.create({
          data: {
            product_id: productId,
            user_id: userId,
            start_date: start_date,
            end_date: end_date,
            at_price_daily: product.rent_price_daily,
          }
        });
        createBooking.id = Number(createBooking.id);
        await this.rentResolveSet();
        await this.rentResolveDelete();
        if(createBooking) return true;
      });
    }
    catch(e){
      console.log(e);
      return false;
    }
  }

  async findFutureBookingsByProductId(productId: number) {
    try{
      this.rentResolveSet();
      this.rentResolveDelete();
      return await this.db.booking.findMany({
        where: {
          product_id: productId,
          end_date: {
            gt: new Date(),
          },
        },
        orderBy: {
          start_date: 'asc',
        },
        select: {
          start_date: true,
          end_date: true,
        }
      });
    }
    catch(e){
      console.log(e);
      return null;
    }
    
  }

  async rentResolveSet(){
    try{
      const rentStarted = await this.db.booking.findMany({
        where: {
          start_date: {
            lt: new Date(),
          },
          end_date: {
            gt: new Date(),
          },
        },
      });
  
      for (const booking of rentStarted) {
        const product = await this.db.product.findUnique({
          where: {
            id: booking.product_id,
          },
          select: {
            status: true,
          },
        });

        if (product && product.status !== ProductStatus.SOLD) {
          await this.db.product.update({
            where: {
              id: booking.product_id,
            },
            data: {
              status: ProductStatus.RENTED,
              received_by_id: booking.user_id,
            },
          });
        }
      }
    }
    catch(e){
      console.log(e);
    } 
  }

  async rentResolveDelete(){
    try{
      const bookings = await this.db.booking.findMany({
        where: {
          end_date: {
            lt: new Date(),
          },
        },
      });
  
      for (const booking of bookings) {
        const product = await this.db.product.findUnique({
          where: {
            id: booking.product_id,
          },
          select: {
            status: true,
          },
        });
      
        if (product && product.status !== ProductStatus.SOLD) {
          await this.db.product.update({
            where: {
              id: booking.product_id,
            },
            data: {
              status: ProductStatus.AVAILABLE,
              received_by_id: null,
            },
          });
        }

        await this.db.booking.delete({
          where: {
            id: booking.id,
          },
        });
      }
    }
    catch(e){
      console.log(e);
    }
  }

  //done
  //need to add validation to check if the product is uploaded by the user
  async remove(id: number, email: string) : Promise<Boolean> {
    try{
      const product:any = await this.db.product.findUnique({
        where: {
          id: id
        },
        include: {
          uploaded_by: true
        }
      });

      if (!product) {
        return false;
      }

      if (product.uploaded_by.email !== email || product.status !== ProductStatus.AVAILABLE) {
        return false;
      }

      await this.db.product.delete({
        where: {
          id: id
        }
      });
      return true;
    }
    catch(e){
      console.log(e);
      return false;
    }
  }

  async cleanSession(){
    try{
      await this.db.session.deleteMany({
        where: {
          expiry: {
            lt: new Date(),
          },
        },
      });
    }
    catch(e){
      console.log(e);
    }
  }

  async scheduleRentResolve() {
    //should be at 12:00am BDT, 6:00pm UTC
    cron.schedule('0 18 * * *', async () => {
      console.log('Running scheduled tasks...');
      try{
        await this.rentResolveSet();
        await this.rentResolveDelete();
        await this.cleanSession();
        console.log("Scheduled tasks completed");
      }
      catch(e){
        console.error(e);
      }
    });
    
  }
}
