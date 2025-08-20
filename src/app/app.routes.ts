import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';

export const routes: Routes = [
  { 
    path: '', 
    component: LandingPageComponent,
    children: [
      { path: '', redirectTo: 'stock', pathMatch: 'full' },
      { 
        path: 'stock', 
        loadChildren: () => import('./modules/stock/stock.module').then(m => m.StockModule) 
      }
    ]
  }
];