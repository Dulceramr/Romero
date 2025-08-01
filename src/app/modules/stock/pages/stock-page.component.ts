import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject, takeUntil, finalize } from 'rxjs';
import { IStock } from '../../../core/models/stock.model';
import { StockService } from '../services/stock.service';

@Component({
  selector: 'app-stock-page',
  templateUrl: './stock-page.component.html',
  styleUrls: ['./stock-page.component.scss']
})
export class StockPageComponent implements OnInit, OnDestroy {
  public dataSource = new MatTableDataSource<IStock>();
  public displayedColumns: string[] = ['name', 'description', 'quantity'];
  public addProductForm: FormGroup;
  public stockForm: FormGroup;  // Cambiado a public
  public isLoading = false;
  public error: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private destroy$ = new Subject<void>();

  constructor(
    private stockService: StockService,
    private fb: FormBuilder
  ) {
    this.stockForm = this.fb.group({
      products: this.fb.array([])
    });

    this.addProductForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      quantity: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadStockData();  // Cambiado de initializeData()
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public loadStockData(): void {  // Renombrado y hecho público
    this.isLoading = true;
    this.error = null;

    this.stockService.stocks$.pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: stocks => {
        this.dataSource.data = stocks;
        this.buildFormControls(stocks);
      },
      error: err => this.error = 'Failed to load stock data'
    });
  }

  private buildFormControls(stocks: IStock[]): void {
    const formArray = this.stockForm.get('products') as FormArray;
    formArray.clear();
    
    stocks.forEach(stock => {
      formArray.push(this.fb.group({
        id: [stock.id],
        quantity: [stock.quantity, [Validators.required, Validators.min(0)]]
      }));
    });
  }

  public onAddProduct(): void {
    if (this.addProductForm.invalid) return;

    this.isLoading = true;
    this.stockService.addProduct(this.addProductForm.value).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: () => this.addProductForm.reset(),
      error: () => this.error = 'Failed to add product'
    });
  }

  public onSaveChanges(): void {
    if (this.stockForm.invalid || !this.stockForm.dirty) return;

    const updates = (this.stockForm.get('products') as FormArray).controls
      .filter(control => control.dirty)
      .map(control => ({
        id: control.get('id')?.value,
        quantity: control.get('quantity')?.value
      }));

    if (updates.length === 0) return;

    this.isLoading = true;
    this.stockService.batchUpdate(updates).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: () => this.stockForm.markAsPristine(),
      error: () => this.error = 'Failed to update products'
    });
  }

  public applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.dataSource.paginator?.firstPage();
  }

  get productsFormArray(): FormArray {
    return this.stockForm.get('products') as FormArray;
  }

  get totalProducts(): number {
    return this.dataSource.filteredData.length;
  }
}