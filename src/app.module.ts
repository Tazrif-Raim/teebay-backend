import { Module } from '@nestjs/common';
import { GraphqlModule } from './graphql/graphql.module';
import { ProductsModule } from './products/products.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './Auth/auth.module';

@Module({
  imports: [
    GraphqlModule, 
    ProductsModule, 
    PrismaModule, 
    AuthModule
  ],
})
export class AppModule {}
