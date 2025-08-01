import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, combineLatest, of, Observable, throwError } from 'rxjs';
import { catchError, tap, shareReplay, switchMap, map, filter, take } from 'rxjs/operators';
import { IStock } from '../../../core/models/stock.model';

interface AppState {
  stocks: IStock[];
  loading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private apiUrl = '/api/stock';
  private initialState: AppState = {
    stocks: [],
    loading: false,
    error: null
  };

  private stateSubject = new BehaviorSubject<AppState>(this.initialState);
  public state$ = this.stateSubject.asObservable().pipe(shareReplay(1));

  private loadTrigger$ = new BehaviorSubject<void>(undefined);
  private addTrigger$ = new BehaviorSubject<Omit<IStock, 'id'> | null>(null);
  private updateTrigger$ = new BehaviorSubject<{id: number, quantity: number} | null>(null);
  private batchUpdateTrigger$ = new BehaviorSubject<Array<{id: number, quantity: number}> | null>(null);

  constructor(private http: HttpClient) {
    this.initDataFlows();
  }

  private initDataFlows(): void {
    // Flujo de carga
    this.loadTrigger$.pipe(
      switchMap(() => this.handleLoadRequest())
    ).subscribe();

    // Flujo para agregar items
    this.addTrigger$.pipe(
      filter((item): item is Omit<IStock, 'id'> => item !== null),
      switchMap(item => this.handleAddRequest(item))
    ).subscribe();

    // Flujo para actualizar items
    this.updateTrigger$.pipe(
      filter((update): update is {id: number, quantity: number} => update !== null),
      switchMap(update => this.handleUpdateRequest(update))
    ).subscribe();

    // Flujo para actualización múltiple
    this.batchUpdateTrigger$.pipe(
      filter((updates): updates is Array<{id: number, quantity: number}> => updates !== null),
      switchMap(updates => this.handleBatchUpdate(updates))
    ).subscribe();
  }

  private handleLoadRequest(): Observable<IStock[]> {
    this.updateState({ loading: true, error: null });
    return this.http.get<IStock[]>(this.apiUrl).pipe(
      tap((stocks: IStock[]) => this.updateState({ stocks, loading: false })),
      catchError((error: any) => {
        this.updateState({ error: 'Error al cargar inventario', loading: false });
        return of([]);
      })
    );
  }

  private handleAddRequest(item: Omit<IStock, 'id'>): Observable<IStock | null> {
    this.updateState({ loading: true });
    return this.http.post<IStock>(this.apiUrl, item).pipe(
      tap((newItem: IStock) => {
        const current = this.stateSubject.value;
        this.updateState({
          stocks: [...current.stocks, newItem],
          loading: false
        });
      }),
      catchError((error: any) => {
        this.updateState({ error: 'Error al agregar producto', loading: false });
        return of(null);
      })
    );
  }

  private handleUpdateRequest(update: {id: number, quantity: number}): Observable<IStock> {
    this.updateState({ loading: true });
    return this.http.patch<IStock>(`${this.apiUrl}/${update.id}`, { 
      quantity: update.quantity 
    }).pipe(
      tap((updatedItem: IStock) => {
        const current = this.stateSubject.value;
        this.updateState({
          stocks: current.stocks.map((item: IStock) => 
            item.id === update.id ? { ...item, quantity: update.quantity } : item
          ),
          loading: false
        });
      }),
      catchError((error: any) => {
        this.updateState({ error: 'Error al actualizar cantidad', loading: false });
        return throwError(() => error);
      })
    );
  }

  private updateState(partialState: Partial<AppState>): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      ...partialState
    });
  }

  private handleBatchUpdate(updates: Array<{id: number, quantity: number}>): Observable<(IStock | null)[]> {
    this.updateState({ loading: true });
    
    if (updates.length === 0) {
      this.updateState({ loading: false });
      return of([]);
    }

    const updateRequests: Array<Observable<IStock | null>> = updates.map(
      (update: {id: number, quantity: number}) => {
        return this.http.patch<IStock>(
          `${this.apiUrl}/${update.id}`, 
          { quantity: update.quantity }
        ).pipe(
          catchError(() => of(null))
        );
      }
    );

    return combineLatest(updateRequests).pipe(
      tap((results: (IStock | null)[]) => {
        const current = this.stateSubject.value;
        const updatedStocks: IStock[] = current.stocks.map((stock: IStock) => {
          const updateResult = results.find(r => r?.id === stock.id);
          return updateResult ? { ...updateResult } : { ...stock };
        });
        this.updateState({ 
          stocks: updatedStocks, 
          loading: false 
        });
      })
    );
  }

  // API pública
  public loadStockItems(): void {
    this.loadTrigger$.next();
  }

  public addStockItem(item: Omit<IStock, 'id'>): Observable<IStock | null> {
    this.addTrigger$.next(item);
    return this.state$.pipe(
      map(state => state.stocks.find(s => s.name === item.name)),
      filter((stock): stock is IStock => !!stock),
      take(1)
    );
  }

  public updateStockQuantity(id: number, quantity: number): Observable<IStock> {
    this.updateTrigger$.next({id, quantity});
    return this.state$.pipe(
      map((state: AppState) => state.stocks.find((item: IStock) => item.id === id)),
      filter((stock): stock is IStock => !!stock),
      take(1)
    );
  }

  public batchUpdateStocks(updates: Array<{id: number, quantity: number}>): Observable<IStock[]> {
    this.batchUpdateTrigger$.next(updates);
    return this.state$.pipe(
      map(state => state.stocks),
      take(1)
    );
  }
}