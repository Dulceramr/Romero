import { Component } from '@angular/core';
import { StockService } from '../services/stock.service';
import { IStock } from '../../../core/models/stock.model';

@Component({
  selector: 'app-stock-display',
  templateUrl: './stock-display.component.html',
  styleUrl: './stock-display.component.scss'
})
export class StockDisplayComponent {
  constructor(private stockService: StockService) {}

  get stocks$() {
    return this.stockService.stocks$;
  }

  updateStock(id: number, quantity: number): void {
    if (quantity < 0) return;
    this.stockService.updateStock(id, quantity).subscribe();
  }
}