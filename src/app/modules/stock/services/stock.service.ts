import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, forkJoin } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IStock } from '../../../core/models/stock.model';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private apiUrl = 'http://localhost:3000/stock';
  private stocksSubject = new BehaviorSubject<IStock[]>([]);
  public stocks$ = this.stocksSubject.asObservable();
  public loading = new BehaviorSubject<boolean>(false);
  public error = new BehaviorSubject<string | null>(null);
  public state$ = this.stocksSubject.asObservable();

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.loadInitialStocks();
  }

  private loadInitialStocks(): void {
    this.loading.next(true);
    this.http.get<IStock[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error loading stocks:', error);
        this.showError('Error al cargar los productos');
        this.error.next('Error al cargar los productos');
        this.loading.next(false);
        return throwError(error);
      })
    ).subscribe({
      next: (stocks: IStock[]) => {
        this.stocksSubject.next(stocks);
        this.loading.next(false);
      }
    });
  }

  public addStock(stock: Omit<IStock, 'id'>): Observable<IStock> {
    this.loading.next(true);
    return this.http.post<IStock>(this.apiUrl, stock).pipe(
      tap((newStock: IStock) => {
        const currentStocks = this.stocksSubject.value;
        this.stocksSubject.next([...currentStocks, newStock]);
        this.showSuccess('Producto añadido correctamente');
        this.loading.next(false);
      }),
      catchError(error => {
        this.showError('Error al añadir el producto');
        this.error.next('Error al añadir el producto');
        this.loading.next(false);
        return throwError(error);
      })
    );
  }

  public getStockItems(): Observable<IStock[]> {
    return this.stocks$;
  }

  public updateStock(id: number, quantity: number): Observable<IStock> {
    this.loading.next(true);
    return this.http.patch<IStock>(`${this.apiUrl}/${id}`, { 
      quantity: quantity 
    }).pipe(
      tap((updatedStock: IStock) => {
        const currentStocks = this.stocksSubject.value;
        const updatedStocks = currentStocks.map(stock => 
          stock.id === id ? { ...stock, quantity } : stock
        );
        this.stocksSubject.next(updatedStocks);
        this.showSuccess('Stock actualizado correctamente');
        this.loading.next(false);
      }),
      catchError(error => {
        this.showError('Error al actualizar el stock');
        this.error.next('Error al actualizar el stock');
        this.loading.next(false);
        return throwError(error);
      })
    );
  }

  public batchUpdateStocks(updates: Array<{id: number, quantity: number}>): Observable<IStock[]> {
    this.loading.next(true);
    const updateRequests: Observable<IStock>[] = updates.map(update => 
      this.http.patch<IStock>(`${this.apiUrl}/${update.id}`, { quantity: update.quantity })
    );

    return forkJoin(updateRequests).pipe(
      tap((updatedStocks: IStock[]) => {
        const currentStocks = this.stocksSubject.value;
        const newStocks = currentStocks.map(stock => {
          const update = updatedStocks.find(u => u.id === stock.id);
          return update ? update : stock;
        });
        this.stocksSubject.next(newStocks);
        this.showSuccess('Stocks actualizados correctamente');
        this.loading.next(false);
      }),
      catchError(error => {
        this.showError('Error al actualizar los stocks');
        this.error.next('Error al actualizar los stocks');
        this.loading.next(false);
        return throwError(error);
      })
    );
  }

  public loadStockItems(): void {
    this.loadInitialStocks();
  }

  public updateStockQuantity(id: number, quantityDelta: number): Observable<IStock> {
    return this.updateStock(id, quantityDelta);
  }

  public deleteStock(id: number): Observable<void> {
  this.loading.next(true);
  return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
    tap(() => {
      const currentStocks = this.stocksSubject.value;
      this.stocksSubject.next(currentStocks.filter(stock => stock.id !== id));
      this.showSuccess('Producto eliminado correctamente');
      this.loading.next(false);
    }),
    catchError(error => {
      this.showError('Error al eliminar el producto');
      this.loading.next(false);
      return throwError(() => error);
    })
  );
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }
}