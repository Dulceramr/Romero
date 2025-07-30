export interface Order {
  id?: number;
  productId: number;      // Relación con el stock
  quantity: number;
  destination: string;
  status: 'pending' | 'shipped' | 'delivered';
  createdAt?: Date;       // Auto-generado
}