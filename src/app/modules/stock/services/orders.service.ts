import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Order } from '../../../core/models/orders.model';
import { InMemoryDataService } from '../../../core/services/in-memory-data.service';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  constructor(private inMemoryDataService: InMemoryDataService) { }

  createOrder(order: Omit<Order, 'id' | 'createdAt' | 'status'>): Observable<Order> {
    return this.inMemoryDataService.createOrder(order);
  }

  getOrders(): Observable<Order[]> {
    return this.inMemoryDataService.getOrders();
  }

  updateOrderStatus(id: number, status: 'completed' | 'cancelled'): Observable<Order> {
    return this.inMemoryDataService.updateOrderStatus(id, status);
  }
}