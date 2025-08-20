export interface IStock {
  id: number;
  name: string;
  description?: string;
  quantity: number;
  createdAt?: Date;
  updatedAt?: Date;
  category?: string;
  location?: string;
}