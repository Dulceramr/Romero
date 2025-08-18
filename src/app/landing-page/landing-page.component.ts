import { Component, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { HomeComponent } from '../modules/stock/components/home.component';

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
    MatChipsModule,
    HomeComponent,
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {
  @ViewChild('routerContent') mainContent!: ElementRef;

  showBackToTop = false;

  navLinks: NavLink[] = [
    { path: '/stock', label: 'Stock', icon: 'science' },
    { path: '/stock/orders', label: 'Órdenes', icon: 'list_alt' }
  ];

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showBackToTop = window.pageYOffset > 300;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  scrollToContent() {
    this.mainContent.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }
}