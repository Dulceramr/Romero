export interface IStock {
  id: number;
  name:string;
  description?: string;
  quantity: number;
  category: string;
  location?: string;
  createdAt?: Date;
  updatedAt?: Date;
}