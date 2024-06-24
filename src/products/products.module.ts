import { Module, OnModuleInit } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsResolver } from './products.resolver';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/Auth/auth.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [ProductsResolver, ProductsService, PrismaService, AuthService],
})
export class ProductsModule implements OnModuleInit {
  constructor(private readonly productsService: ProductsService) {}

  async onModuleInit() {
    await this.productsService.scheduleRentResolve();
  }
}
