import { ConflictException, Injectable } from '@nestjs/common';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Product } from './entities/product.entity';
import { ProductStatus } from './entities/product-status.enum';
import * as cron from 'node-cron';

@Injectable()
export class ProductsService {
  constructor(private readonly db: PrismaService) {}
  
  eemail: string = 'raim@gmail.com';

  async createProduct(rawProductData: CreateProductInput): Promise<Product> {
    //productData.status = ProductStatus.AVAILABLE;
    //productData.createdAt = new Date();
    //productData.updatedAt = productData.createdAt;
    //productData.uploaded_by_id = productData.uploaded_by.id;
    const { categories, ...productData } = rawProductData;
    try{
      const user:any = await this.db.user.findUnique({
        where: {
          email: this.eemail
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
          uploaded_by_id: uploaded_by_id
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

  async findAllAvailableProduct() : Promise<Product[] | null> {
    try{
      const products:any = await this.db.product.findMany({
        where: {
          status: ProductStatus.AVAILABLE && ProductStatus.RENTED
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

  async findAllProductRelatedToUser(email: string) : Promise<Product[] | null> {
    try{
      const user:any = await this.db.user.findUnique({
        where: {
          email: this.eemail
        }
      });
      const uploaded_or_received_by_id:any = user.id;
      const products:any = await this.db.product.findMany({
        where: {
          uploaded_by_id: uploaded_or_received_by_id,
          received_by_id: uploaded_or_received_by_id
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

  async findOneProduct(id: number) : Promise<Product> {
    const product:any = await this.db.product.findUnique({
      where: {
        id: id
      },
      include: {
        categories: true,
        uploaded_by: true
      }
    });
    product.id = Number(product.id);
    return product;
  }

  async update(updateProductInput: UpdateProductInput) : Promise<Product | null> {
    try {
      const { id, categories, ...productData } = updateProductInput;

      const currentProduct:any = await this.db.product.findUnique({
        where: {
          id: id
        },
        include: {
          categories: true
        }
      });

      if (!currentProduct) {
        return null;
      }

      // if (currentProduct.uploaded_by.email !== this.eemail) {
      //   return null;
      // }

      const currentCategoryNames = currentProduct.categories.map(category => category.category.name);
      const newCategoryNames = categories.map(category => category.category_name);

      const categoriesToAdd = newCategoryNames.filter(name => !currentCategoryNames.includes(name));
      const categoriesToRemove = currentCategoryNames.filter(name => !newCategoryNames.includes(name));

      const product:any = await this.db.product.update({
        where: { id: id },
        data: {
          ...productData,
          categories: {
            connectOrCreate: categoriesToAdd.map(categoryName => ({
              where: { product_id_category_name: { product_id: id, category_name: categoryName } },
              create: { category_name: categoryName },
            })),
            disconnect: categoriesToRemove.map(categoryName => ({
              product_id_category_name: { product_id: id, category_name: categoryName },
            })),
          },
        },
        include: {
          categories: true,
          uploaded_by: true,
        },
      });
      product.id = Number(product.id);
      return product;
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
        
        await db.$executeRaw`SET TRANSACTION ISOLATION LEVEL REPEATABLE READ`;
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
  
        if (product.status !== ProductStatus.AVAILABLE) {
          throw new ConflictException('Product is not available for sell');
        }

        const bookings = await this.findFutureBookingsByProductId(productId);
        let availableAfter = new Date(); 
        if (bookings && bookings.length > 0) {
          availableAfter = bookings.reduce((prev, current) => (prev.end_date > current.end_date) ? prev : current).end_date;
        }
  
        // Step 3: Perform the Action
        const updatedProduct:any = await db.product.update({
          where: { id: productId },
          data: {
            status: ProductStatus.SOLD,
            received_by_id: userId,
            sell_date: availableAfter
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

  async rentProduct(productId: number, action: 'rent', start_date:Date, end_date:Date, email: string) : Promise<any> {
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
          }
        });
  
        if (!product) {
          throw new Error('Product not found');
        }
  
        if (product.status !== ProductStatus.AVAILABLE) {
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
        return createBooking;
      });
    }
    catch(e){
      console.log(e);
      return e;
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
        await this.db.product.update({
          where: {
            id: booking.product_id,
          },
          data: {
            status: ProductStatus.AVAILABLE,
            received_by_id: null,
          },
        });
  
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
  async remove(id: number) : Promise<Boolean> {
    try{
      // const product = await this.db.product.findUnique({
      //   where: {
      //     id: id
      //   }
      // });
      // if (!product) {
      //   return false;
      // }

      // await this.db.booking.deleteMany({
      //   where: {
      //     product_id: id
      //   }
      // });

      // if (product.uploaded_by.email !== this.eemail) {
      //   return false;
      // }
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

  async scheduleRentResolve() {
    //at 12am every night
    cron.schedule('0 0 * * *', async () => {
      console.log('Running scheduled rent resolves...');
      try{
        await this.rentResolveSet();
        await this.rentResolveDelete();
        console.log("Scheduled rent resolves completed");
      }
      catch(e){
        console.error(e);
      }
    });
    
  }
}
