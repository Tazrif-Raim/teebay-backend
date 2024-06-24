import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsResolver } from './products.resolver';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/Auth/auth.service';

@Module({
  providers: [ProductsResolver, ProductsService, PrismaService, AuthService],
})
export class ProductsModule {}
