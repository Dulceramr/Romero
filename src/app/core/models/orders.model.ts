export interface Order {
  id?: number;
  productId: number;
  productName: string;
  quantity: number;
  destination: string;
  notes?: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
}