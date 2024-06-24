import { registerEnumType } from '@nestjs/graphql';

export enum ProductStatus {
  AVAILABLE = 'AVAILABLE',
  SOLD = 'SOLD',
  RENTED = 'RENTED',
}

registerEnumType(ProductStatus, {
  name: 'ProductStatus',
});