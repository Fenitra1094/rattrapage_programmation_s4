import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['../shared.css', './dashboard.component.css']
})
export class DashboardComponent {
  dateMin = '';
  dateMax = '';
  resume: any = null;
  lots: any[] = [];
  loading = false;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    this.dateMin = `${y}-${m}-01`;
    this.dateMax = now.toISOString().substring(0, 10);
  }

  search() {
    if (!this.dateMin || !this.dateMax) return;
    this.loading = true;
    this.api.getDashboard(this.dateMin, this.dateMax).subscribe({
      next: data => {
        this.resume = data.resume;
        this.lots = data.lots;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
