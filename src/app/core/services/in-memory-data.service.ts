import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { IStock } from '../models/stock.model';
import { Order } from '../models/orders.model';

@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService {
  private stocks: IStock[] = [
    {
      "id": 1,
      "name": "Tubos de ensayo (50ml)",
      "quantity": 1104,
      "category": "Materiales",
      "location": "Almacén A"
    },
    {
      "id": 2,
      "name": "Guantes de nitrilo",
      "quantity": 250,
      "category": "Seguridad",
      "location": "Almacén B"
    },
    {
      "id": 3,
      "name": "Microscopios digitales",
      "quantity": 10,
      "category": "Instrumentos",
      "location": "Laboratorio Central"
    },
    {
      "id": 4,
      "name": "Batas de laboratorio (talla M)",
      "quantity": 79,
      "category": "Indumentaria",
      "location": "Almacén C"
    },
    {
      "id": 5,
      "name": "Reactivo químico X-21",
      "quantity": 30,
      "category": "Reactivos",
      "location": "Almacén A"
    },
    {
      "id": 6,
      "name": "Mascarillas N95",
      "quantity": 100,
      "category": "Seguridad",
      "location": "Almacén B"
    },
    {
      "id": 7,
      "name": "Centrífuga de mesa",
      "quantity": 8,
      "category": "Instrumentos",
      "location": "Laboratorio Central"
    },
    {
      "id": 8,
      "name": "Pipetas automáticas (1-10µl)",
      "quantity": -1,
      "category": "Materiales",
      "location": "Almacén A"
    },
    {
      "id": 9,
      "name": "Gafas de seguridad",
      "quantity": 120,
      "category": "Seguridad",
      "location": "Almacén B"
    },
    {
      "id": 10,
      "name": "Placas Petri (estériles)",
      "quantity": 200,
      "category": "Materiales",
      "location": "Almacén C"
    }
  ];

  private orders: Order[] = [
    {
      "id": 6557,
      "productId": 1,
      "productName": "Tubos de ensayo (50ml)",
      "quantity": 1,
      "destination": "cu",
      "notes": "prueba1",
      "status": "pending",
      "createdAt": "2025-08-01T03:02:17.660Z"
    },
    {
      "id": 5574,
      "productId": 2,
      "productName": "",
      "quantity": 1,
      "destination": "unam",
      "notes": "prueba2",
      "status": "pending",
      "createdAt": "2025-08-01T03:17:12.255Z"
    },
    {
      "id": 4,
      "productId": 4,
      "productName": "Batas de laboratorio (talla M)",
      "quantity": 1,
      "destination": "asd",
      "notes": "prueba 3",
      "status": "pending",
      "createdAt": "2025-08-01T04:02:40.653Z"
    },
    {
      "id": 4,
      "productId": 4,
      "productName": "Batas de laboratorio (talla M)",
      "quantity": 4,
      "destination": "sdasd",
      "notes": "prueba 4",
      "status": "pending",
      "createdAt": "2025-08-01T04:04:12.419Z"
    },
    {
      "id": 56,
      "productId": 6,
      "productName": "Mascarillas N95",
      "quantity": 10,
      "destination": "ghv",
      "notes": "ghghggh",
      "status": "pending",
      "createdAt": "2025-08-01T18:51:33.908Z"
    },
    {
      "id": 8,
      "productId": 8,
      "productName": "Pipetas automáticas (1-10µl)",
      "quantity": 1,
      "destination": "dsfsdfdsf",
      "notes": "sdf",
      "status": "pending",
      "createdAt": "2025-08-01T19:13:08.779Z"
    }
  ];

  private stocksSubject = new BehaviorSubject<IStock[]>(this.stocks);
  stocks$ = this.stocksSubject.asObservable();

  private ordersSubject = new BehaviorSubject<Order[]>(this.orders);
  orders$ = this.ordersSubject.asObservable();

  constructor() { }

  // Stock methods
  getStocks(): Observable<IStock[]> {
    return this.stocks$.pipe(delay(500));
  }

  addStock(stock: Omit<IStock, 'id'>): Observable<IStock> {
    const newStock: IStock = {
      id: this.generateId(),
      ...stock
    };
    this.stocks.push(newStock);
    this.stocksSubject.next([...this.stocks]);
    return of(newStock).pipe(delay(500));
  }

  updateStock(id: number, quantity: number): Observable<IStock> {
    const stockIndex = this.stocks.findIndex(s => s.id === id);
    if (stockIndex > -1) {
      this.stocks[stockIndex] = { ...this.stocks[stockIndex], quantity };
      this.stocksSubject.next([...this.stocks]);
      return of(this.stocks[stockIndex]).pipe(delay(500));
    }
    return throwError(() => new Error('Stock not found')).pipe(delay(500));
  }

  batchUpdateStocks(updates: Array<{id: number, quantity: number}>): Observable<IStock[]> {
    const updatedStocks: IStock[] = [];
    updates.forEach(update => {
      const stockIndex = this.stocks.findIndex(s => s.id === update.id);
      if (stockIndex > -1) {
        this.stocks[stockIndex] = { ...this.stocks[stockIndex], quantity: update.quantity };
        updatedStocks.push(this.stocks[stockIndex]);
      }
    });
    this.stocksSubject.next([...this.stocks]);
    return of(updatedStocks).pipe(delay(500));
  }

  deleteStock(id: number): Observable<void> {
    const stockIndex = this.stocks.findIndex(s => s.id === id);
    if (stockIndex > -1) {
      this.stocks.splice(stockIndex, 1);
      this.stocksSubject.next([...this.stocks]);
      return of(undefined).pipe(delay(500));
    }
    return throwError(() => new Error('Stock not found')).pipe(delay(500));
  }

  // Order methods
  getOrders(): Observable<Order[]> {
    return this.orders$.pipe(delay(500));
  }

  createOrder(order: Omit<Order, 'id' | 'createdAt' | 'status'>): Observable<Order> {
    const newOrder: Order = {
      id: this.generateId(),
      ...order,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    this.orders.push(newOrder);
    this.ordersSubject.next([...this.orders]);
    return of(newOrder).pipe(delay(500));
  }

  updateOrderStatus(id: number, status: 'completed' | 'cancelled'): Observable<Order> {
    const orderIndex = this.orders.findIndex(o => o.id === id);
    if (orderIndex > -1) {
      this.orders[orderIndex] = { ...this.orders[orderIndex], status };
      this.ordersSubject.next([...this.orders]);
      return of(this.orders[orderIndex]).pipe(delay(500));
    }
    return throwError(() => new Error('Order not found')).pipe(delay(500));
  }

  private generateId(): number {
    return Math.floor(Math.random() * 1000);
  }
}
