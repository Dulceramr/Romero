import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IStock } from '../../../core/models/stock.model';

@Injectable({
  providedIn: 'root' // Disponible en toda la app (puedes cambiarlo al módulo si prefieres)
})
export class StockService {
  private apiUrl = 'http://localhost:3000/stock'; // URL de JSON Server

  constructor(private http: HttpClient) {}

  // Obtener todos los productos
  getStock(): Observable<IStock[]> {
    return this.http.get<IStock[]>(this.apiUrl);
  }

  // Agregar un producto
  addProduct(product: IStock): Observable<IStock> {
    return this.http.post<IStock>(this.apiUrl, product);
  }

  // Actualizar un producto
  updateProduct(id: number, product: Partial<IStock>): Observable<IStock> {
    return this.http.put<IStock>(`${this.apiUrl}/${id}`, product);
  }

  // Eliminar un producto (opcional)
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}