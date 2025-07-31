import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-stock-page',
  templateUrl: './stock-page.component.html',
  styleUrl: './stock-page.component.scss'
})
export class StockPageComponent implements OnInit {
  showDirect = false;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.showDirect = this.route.snapshot.data['showDirect'] || false;
  }
}
