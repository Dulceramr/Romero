import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject, takeUntil, catchError, EMPTY, forkJoin, tap, Observable } from 'rxjs';
import { IStock } from '../../../core/models/stock.model';
import { StockService } from '../services/stock.service';

@Component({
  selector: 'app-stock-page',
  templateUrl: './stock-page.component.html',
  styleUrls: ['./stock-page.component.scss']
})
export class StockPageComponent implements OnInit, OnDestroy, AfterViewInit {
  // Material Table properties
  dataSource = new MatTableDataSource<IStock>();
  displayedColumns: string[] = ['name', 'description', 'quantity'];

  // ViewChild decorators to get references to the paginator and sort
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Form properties
  stockForm: FormGroup;

  // State management properties
  isLoading = true;
  error: string | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private stockService: StockService,
    private fb: FormBuilder
  ) {
    this.stockForm = this.fb.group({
      products: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadStockData();
  }

  ngAfterViewInit(): void {
    // These need to be set after the view has been initialized
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

get products(): FormArray {
  return this.stockForm.get('products') as FormArray;
}

  loadStockData(): void {
    this.isLoading = true;
    this.error = null;
    this.stockService.getStockItems().pipe(
      takeUntil(this.destroy$),
      tap(stocks => {
        this.dataSource.data = stocks;
        this.buildForm(stocks);
        this.isLoading = false;
      }),
      catchError(() => {
        this.error = 'Failed to load stock data. Please try again later.';
        this.isLoading = false;
        return EMPTY;
      })
    ).subscribe();
  }

buildForm(stocks: IStock[]): void {
  // Limpiar el FormArray de manera segura
  while (this.products.length !== 0) {
    this.products.removeAt(0);
  }

  // Agregar nuevos controles
  stocks.forEach(stock => {
    const productGroup = this.fb.group({
      id: [stock.id],
      quantity: [stock.quantity]
    });
    this.products.push(productGroup);
  });
}

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  saveChanges(): void {
    if (this.stockForm.invalid || !this.stockForm.dirty) {
    return;
  }

  this.isLoading = true;
  const updateObservables: Observable<any>[] = []; // Tipo explícito aquí

  this.products.controls.forEach(control => {
    if (control.dirty) {
      const productId = control.get('id')?.value;
      const newQuantity = control.get('quantity')?.value;
      if (productId && newQuantity !== undefined) {
        updateObservables.push(
          this.stockService.updateStock(productId, newQuantity)
        );
      }
    }
    });

    if (updateObservables.length > 0) {
      forkJoin(updateObservables).pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          // The service already shows a snackbar for individual errors
          return EMPTY;
        }),
      ).subscribe(() => {
        this.stockForm.markAsPristine();
        this.isLoading = false;
        // Optionally, reload data to confirm sync with backend
        // this.loadStockData(); 
      });
    } else {
      this.isLoading = false;
    }
  }

  // Helper to get total products count, respecting filter
  get totalProducts(): number {
    return this.dataSource?.filteredData?.length || 0;
  }
}