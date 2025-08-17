import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Order } from '../../../core/models/orders.model';
import { ORDERS_DATA } from '../../../core/mocks/db.mock';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  constructor() {}

  createOrder(order: Order): Observable<Order> {
    // Simulate adding a new order
    const newOrder = { ...order, id: new Date().getTime() };
    ORDERS_DATA.push(newOrder);
    return of(newOrder).pipe(delay(300));
  }

  getOrders(): Observable<Order[]> {
    // 20% chance of error
    if (Math.random() > 0.2) {
      return of(ORDERS_DATA).pipe(delay(300));
    } else {
      return throwError(() => new Error('Mock API Failure: Could not fetch orders.'));
    }
  }

  updateOrderStatus(
    id: number,
    status: 'completed' | 'cancelled'
  ): Observable<Order> {
    const orderIndex = ORDERS_DATA.findIndex((o) => o.id === id);
    if (orderIndex === -1) {
      return throwError(() => new Error('Order not found.'));
    }
    const updatedOrder = { ...ORDERS_DATA[orderIndex], status };
    ORDERS_DATA[orderIndex] = updatedOrder;
    return of(updatedOrder).pipe(delay(300));
  }
}