import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardService, DashboardData, DashboardStats } from './dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: false,
})
export class DashboardComponent implements OnInit {
  breadCrumbItems!: Array<{}>;
  loading = true;
  data: DashboardData | null = null;
  stats: DashboardStats | null = null;
  recentContactSubmissions: { id: string; name: string; email: string; message: string; createdAt: string }[] = [];

  private dashboardService = inject(DashboardService);

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Travel Insolite' },
      { label: 'Dashboard', active: true }
    ];
    this.load();
  }

  load(): void {
    this.loading = true;
    this.dashboardService.getDashboard().subscribe(res => {
      this.data = res ?? null;
      this.stats = res?.stats ?? null;
      this.recentContactSubmissions = res?.recentContactSubmissions ?? [];
      this.loading = false;
    });
  }

  formatDate(iso: string): string {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return isNaN(d.getTime()) ? iso : d.toLocaleString();
    } catch {
      return iso;
    }
  }
}
