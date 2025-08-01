import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';

interface NavLink {
  path: string;
  label: string;
  icon: string;
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    MatToolbarModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {
  navLinks: NavLink[] = [
    { path: '/stock', label: 'Stock', icon: 'science' },
    { path: '/stock/orders', label: 'Órdenes', icon: 'list_alt' }
  ];
}