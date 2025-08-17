import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, throwError, forkJoin } from 'rxjs';
import { delay, tap, catchError } from 'rxjs/operators';
import { IStock } from '../../../core/models/stock.model';
import { STOCK_DATA } from '../../../core/mocks/db.mock';

@Injectable({
  providedIn: 'root',
})
export class StockService {
  private stocksSubject = new BehaviorSubject<IStock[]>([]);
  public stocks$ = this.stocksSubject.asObservable();
  public loading = new BehaviorSubject<boolean>(false);
  public error = new BehaviorSubject<string | null>(null);

  constructor() {
    this.loadInitialStocks();
  }

  private loadInitialStocks(): void {
    this.loading.next(true);
    of(STOCK_DATA)
      .pipe(
        delay(300),
        catchError((error) => {
          this.error.next('Error al cargar los productos');
          this.loading.next(false);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (stocks: IStock[]) => {
          this.stocksSubject.next(stocks);
          this.loading.next(false);
        },
      });
  }

  public addStock(stock: Omit<IStock, 'id'>): Observable<IStock> {
    this.loading.next(true);
    const newStock: IStock = { id: new Date().getTime(), ...stock };
    const currentStocks = this.stocksSubject.value;
    this.stocksSubject.next([...currentStocks, newStock]);
    this.loading.next(false);
    return of(newStock).pipe(delay(300));
  }

  public getStockItems(): Observable<IStock[]> {
    return this.stocks$;
  }

  public updateStock(id: number, quantity: number): Observable<IStock> {
    this.loading.next(true);
    const currentStocks = this.stocksSubject.value;
    const stockIndex = currentStocks.findIndex((s) => s.id === id);

    if (stockIndex === -1) {
      this.loading.next(false);
      return throwError(() => new Error('Stock not found.'));
    }

    const updatedStock = { ...currentStocks[stockIndex], quantity };
    const updatedStocks = [...currentStocks];
    updatedStocks[stockIndex] = updatedStock;

    this.stocksSubject.next(updatedStocks);
    this.loading.next(false);
    return of(updatedStock).pipe(delay(300));
  }

  public batchUpdateStocks(
    updates: Array<{ id: number; quantity: number }>
  ): Observable<IStock[]> {
    this.loading.next(true);
    const currentStocks = this.stocksSubject.value;
    const updatedStocks = currentStocks.map((stock) => {
      const update = updates.find((u) => u.id === stock.id);
      return update ? { ...stock, quantity: update.quantity } : stock;
    });

    this.stocksSubject.next(updatedStocks);
    this.loading.next(false);
    return of(updatedStocks).pipe(delay(300));
  }

  public deleteStock(id: number): Observable<void> {
    this.loading.next(true);
    const currentStocks = this.stocksSubject.value;
    const newStocks = currentStocks.filter((stock) => stock.id !== id);
    this.stocksSubject.next(newStocks);
    this.loading.next(false);
    return of(undefined).pipe(delay(300));
  }
}