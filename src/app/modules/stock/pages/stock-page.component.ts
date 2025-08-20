import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { IStock } from '../../../core/models/stock.model';
import { StockService } from '../services/stock.service';
import { ConfirmationDialogComponent } from '../components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-stock-page',
  templateUrl: './stock-page.component.html',
  styleUrls: ['./stock-page.component.scss']
})
export class StockPageComponent implements OnInit, OnDestroy {
  dataSource = new MatTableDataSource<IStock>();
  displayedColumns: string[] = ['name', 'description', 'quantity'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  stockForm: FormGroup;
  addProductForm: FormGroup;
  
  private destroy$ = new Subject<void>();

  constructor(
    private stockService: StockService,
    private fb: FormBuilder,
    private dialog: MatDialog
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
    
    this.stockService.loading.pipe(takeUntil(this.destroy$)).subscribe();
    this.stockService.error.pipe(takeUntil(this.destroy$)).subscribe();
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
    this.stockService.getStockItems().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (stocks: IStock[]) => {
        this.dataSource.data = stocks;
        this.buildForm(stocks);
      },
      error: (err: Error) => {
        console.error('Error loading stock data', err);
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
    
    const newProduct = this.addProductForm.value;
    this.stockService.addStock(newProduct).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.addProductForm.reset();
        this.addProductForm.get('quantity')?.setValue(0);
      },
      error: (err: Error) => {
        console.error('Error adding product', err);
      }
    });
  }

  saveChanges(): void {
    if (this.stockForm.invalid || !this.stockForm.dirty) return;

    const updates = this.products.controls
      .filter(control => control.dirty)
      .map(control => ({
        id: control.get('id')?.value as number,
        quantity: control.get('quantity')?.value as number
      }));

    if (updates.length === 0) return;

    const dialogRef = this.dialog.open(ConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      // Reset the form state after dialog is closed
      this.stockForm.reset(this.stockForm.value);
    });

    // The following code can be kept if you still want to perform the action
    // after showing the dialog, or removed if the dialog is purely informational.
    // For this case, we'll assume the action is simulated and confirmed by the dialog.
    /*
    if (updates.length === 1) {
      this.stockService.updateStock(updates[0].id, updates[0].quantity).pipe(
        takeUntil(this.destroy$)
      ).subscribe();
    } else {
      this.stockService.batchUpdateStocks(updates).pipe(
        takeUntil(this.destroy$)
      ).subscribe();
    }
    */
  }

  deleteProduct(id: number): void {
  this.stockService.deleteStock(id).pipe(
    takeUntil(this.destroy$)
  ).subscribe({
    next: () => {
      this.loadStockData();
    },
    error: (err: Error) => {
      console.error('Error deleting product', err);
    }
  });
}

  get totalProducts(): number {
    return this.dataSource?.filteredData?.length || 0;
  }

  get isLoading(): boolean {
    return this.stockService.loading.value;
  }

  get error(): string | null {
    return this.stockService.error.value;
  }
}
