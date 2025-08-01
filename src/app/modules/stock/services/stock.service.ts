import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IStock } from '../../../core/models/stock.model';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private apiUrl = 'http://localhost:3000/stock'; 
  private stocksSubject = new BehaviorSubject<IStock[]>([]);
  stocks$ = this.stocksSubject.asObservable();

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.loadInitialStocks();
  }

  private loadInitialStocks(): void {
    this.http.get<IStock[]>(this.apiUrl).pipe(
      catchError(error => {
        this.showError('Error al cargar los productos');
        return throwError(error);
      })
    ).subscribe({
      next: (stocks: IStock[]) => this.stocksSubject.next(stocks)
    });
  }

  addStock(stock: Omit<IStock, 'id'>): Observable<IStock> {
    return this.http.post<IStock>(this.apiUrl, stock).pipe(
      tap((newStock: IStock) => {
        const currentStocks = this.stocksSubject.value;
        this.stocksSubject.next([...currentStocks, newStock]);
        this.showSuccess('Producto añadido correctamente');
      }),
      catchError(error => {
        this.showError('Error al añadir el producto');
        return throwError(error);
      })
    );
  }

  getStockItems(): Observable<IStock[]> {
  return this.stocks$.pipe(
    catchError(error => {
      this.showError('Error al obtener los productos');
      return throwError(error);
    })
  );
}

updateStock(id: number, quantityDelta: number): Observable<IStock> {
  return this.http.get<IStock>(`${this.apiUrl}/${id}`).pipe(
    switchMap(currentStock => {
      const newQuantity = currentStock.quantity + quantityDelta;
      return this.http.patch<IStock>(`${this.apiUrl}/${id}`, { 
        quantity: newQuantity 
      });
    }),
    catchError(error => {
      this.showError('Error al actualizar el stock');
      return throwError(error);
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