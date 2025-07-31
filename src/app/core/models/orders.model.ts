export interface Order {
  id?: number;
  productId: number;
  productName?: string;
  quantity: number;
  destination: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt?: Date;
}