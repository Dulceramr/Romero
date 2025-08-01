import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject, takeUntil } from 'rxjs';
import { IStock } from '../../../core/models/stock.model';
import { StockService } from '../services/stock.service';

@Component({
  selector: 'app-stock-page',
  templateUrl: './stock-page.component.html',
  styleUrls: ['./stock-page.component.scss']
})
export class StockPageComponent implements OnInit, OnDestroy {
  dataSource = new MatTableDataSource<IStock>();
  displayedColumns: string[] = ['name', 'description', 'quantity', 'actions'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  stockForm: FormGroup;
  addProductForm: FormGroup;
  
  isLoading = false;
  error: string | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private stockService: StockService,
    private fb: FormBuilder
  ) {
    this.stockForm = this.fb.group({
      products: this.fb.array([])
    });
    
    this.addProductForm = this.fb.group({
      name: [''],
      description: [''],
      quantity: [0]
    });
  }

  ngOnInit(): void {
    this.loadStockData();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStockData(): void {
    this.isLoading = true;
    this.error = null;
    
    this.stockService.loadStockItems();
    
    this.stockService.state$.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (state) => {
        this.dataSource.data = state.stocks;
        this.buildForm(state.stocks);
        this.isLoading = false;
      },
      error: (err: Error) => {
        this.error = 'Error loading stock data';
        this.isLoading = false;
      }
    });
  }

  get products(): FormArray {
    return this.stockForm.get('products') as FormArray;
  }

  private buildForm(stocks: IStock[]): void {
    this.products.clear();
    stocks.forEach(stock => {
      this.products.push(this.fb.group({
        id: [stock.id],
        quantity: [stock.quantity]
      }));
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.dataSource.paginator?.firstPage();
  }

  addProduct(): void {
    if (this.addProductForm.invalid) return;
    
    this.isLoading = true;
    this.stockService.addStockItem(this.addProductForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.addProductForm.reset();
          this.isLoading = false;
        },
        error: (err: Error) => {
          this.error = 'Error adding product';
          this.isLoading = false;
        }
      });
  }

  saveChanges(): void {
    if (this.stockForm.invalid || !this.stockForm.dirty || this.isLoading) return;

    this.isLoading = true;
    this.error = null;

    const updates = this.products.controls
      .filter(control => control.dirty)
      .map(control => ({
        id: control.get('id')?.value as number,
        quantity: control.get('quantity')?.value as number
      }));

    if (updates.length === 0) {
      this.isLoading = false;
      return;
    }

    this.stockService.batchUpdateStocks(updates)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.stockForm.markAsPristine();
          this.isLoading = false;
        },
        error: (err: Error) => {
          this.error = 'Error saving changes';
          this.isLoading = false;
        }
      });
  }

  get totalProducts(): number {
    return this.dataSource?.filteredData?.length || 0;
  }
}