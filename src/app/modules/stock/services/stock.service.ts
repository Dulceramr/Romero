import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, forkJoin } from 'rxjs';
import { catchError, tap, switchMap, take, map } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IStock } from '../../../core/models/stock.model';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private readonly apiUrl = 'http://localhost:3000/stock';
  private readonly stocksSubject = new BehaviorSubject<IStock[]>([]);
  public readonly stocks$ = this.stocksSubject.asObservable();

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.fetchAllStockItems().subscribe();
  }

  private fetchAllStockItems(): Observable<IStock[]> {
    return this.http.get<IStock[]>(this.apiUrl).pipe(
      tap(stocks => this.stocksSubject.next(stocks)),
      catchError(error => this.handleError('Error loading stock items', error))
    );
  }

  public addProduct(product: Omit<IStock, 'id'>): Observable<IStock> {
    return this.http.post<IStock>(this.apiUrl, product).pipe(
      tap(newProduct => {
        this.stocksSubject.next([...this.stocksSubject.value, newProduct]);
        this.showNotification('Product added successfully', 'success');
      }),
      catchError(error => this.handleError('Error adding product', error))
    );
  }

  public updateProductQuantity(id: number, quantityDelta: number): Observable<IStock> {
    return this.http.get<IStock>(`${this.apiUrl}/${id}`).pipe(
      switchMap(currentProduct => {
        const newQuantity = currentProduct.quantity + quantityDelta;
        return this.http.patch<IStock>(`${this.apiUrl}/${id}`, { quantity: newQuantity }).pipe(
          tap(updatedProduct => {
            const updatedItems = this.stocksSubject.value.map(item => 
              item.id === id ? { ...item, quantity: newQuantity } : item
            );
            this.stocksSubject.next(updatedItems);
            this.showNotification('Quantity updated successfully', 'success');
          })
        );
      }),
      catchError(error => this.handleError('Error updating quantity', error))
    );
  }

  public batchUpdate(updates: {id: number, quantity: number}[]): Observable<IStock[]> {
    const updateRequests = updates.map(update => 
      this.updateProductQuantity(update.id, update.quantity)
    );
    return forkJoin(updateRequests);
  }

  private handleError(message: string, error: any): Observable<never> {
    this.showNotification(message, 'error');
    console.error(message, error);
    return throwError(() => new Error(message));
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: [`${type}-snackbar`]
    });
  }
}