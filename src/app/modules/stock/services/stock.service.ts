import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IStock } from '../../../core/models/stock.model';
import { InMemoryDataService } from '../../../core/services/in-memory-data.service';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  public loading = new BehaviorSubject<boolean>(false);
  public error = new BehaviorSubject<string | null>(null);

  constructor(
    private inMemoryDataService: InMemoryDataService,
    private snackBar: MatSnackBar
  ) {
  }

  public get stocks$(): Observable<IStock[]> {
    return this.inMemoryDataService.getStocks();
  }

  public addStock(stock: Omit<IStock, 'id'>): Observable<IStock> {
    this.loading.next(true);
    return this.inMemoryDataService.addStock(stock).pipe(
      tap((newStock: IStock) => {
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
    return this.inMemoryDataService.updateStock(id, quantity).pipe(
      tap((updatedStock: IStock) => {
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
    return this.inMemoryDataService.batchUpdateStocks(updates).pipe(
      tap((updatedStocks: IStock[]) => {
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

  public deleteStock(id: number): Observable<void> {
    this.loading.next(true);
    return this.inMemoryDataService.deleteStock(id).pipe(
      tap(() => {
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

  public updateStockQuantity(id: number, quantityDelta: number): Observable<IStock> {
    // This method is not ideal, as it reads the stock twice.
    // However, it's the simplest way to implement this without changing the in-memory-data.service.
    let stockToUpdate: IStock | undefined;
    this.stocks$.subscribe(stocks => {
      stockToUpdate = stocks.find(s => s.id === id);
    });

    if (stockToUpdate) {
      const newQuantity = stockToUpdate.quantity + quantityDelta;
      return this.updateStock(id, newQuantity);
    } else {
      return throwError(() => new Error('Stock not found'));
    }
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