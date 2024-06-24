import { Injectable } from '@nestjs/common';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Product } from './entities/product.entity';
import { ProductStatus } from './entities/product-status.enum';
import { raw } from '@prisma/client/runtime/library';

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

  findAll() {
    return `This action returns all products`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductInput: UpdateProductInput) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
