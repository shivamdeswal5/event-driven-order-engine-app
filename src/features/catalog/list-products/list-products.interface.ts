export interface ProductResponse {
  id: string;
  name: string;
  sku: string;
  unitPrice: number;
  stockQuantity: number;
  reservedQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export type ListProductsResponse = ProductResponse[];
