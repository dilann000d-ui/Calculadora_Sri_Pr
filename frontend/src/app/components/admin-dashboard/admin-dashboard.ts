import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ChartConfiguration } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError, finalize, timeout } from 'rxjs/operators';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  resumen: any = {};
  porGasto: any[] = [];
  porDia: any[] = [];
  usuarios = 0;
  loading = true;
  error = '';

  private loadingGuard: any = null;
  private retryTimer: any = null;
  private retryCount = 0;
  private readonly maxRetries = 4;
  private dashboardRequestSub: Subscription | null = null;

  barChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  barChartOptions: ChartConfiguration<'bar'>['options'] = { responsive: true };
  barChartType: 'bar' = 'bar';

  lineChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  lineChartOptions: ChartConfiguration<'line'>['options'] = { responsive: true };
  lineChartType: 'line' = 'line';

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    this.retryCount = 0;
    this.cargarEstadisticas();
  }

  ngOnDestroy() {
    if (this.loadingGuard) {
      clearTimeout(this.loadingGuard);
    }
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
    this.dashboardRequestSub?.unsubscribe();
  }

  private scheduleRetry() {
    if (this.retryCount >= this.maxRetries) {
      return;
    }
    this.retryCount += 1;
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
    const delay = 500 + this.retryCount * 350;
    this.retryTimer = setTimeout(() => this.cargarEstadisticas(), delay);
  }

  refreshDashboard() {
    if (this.loadingGuard) {
      clearTimeout(this.loadingGuard);
      this.loadingGuard = null;
    }
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    this.dashboardRequestSub?.unsubscribe();
    this.retryCount = 0;
    this.error = '';
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    this.loading = true;
    this.error = '';

    if (this.loadingGuard) {
      clearTimeout(this.loadingGuard);
    }
    this.loadingGuard = setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        this.error = 'Tiempo de espera agotado. Verifica que el backend este activo y responde.';
        this.scheduleRetry();
      }
    }, 12000);

    const token = this.auth.getToken();
    if (!token) {
      this.error = 'Sesion invalida. Vuelve a iniciar sesion.';
      this.loading = false;
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    const params = { _ts: Date.now() };

    this.dashboardRequestSub?.unsubscribe();
    this.dashboardRequestSub = forkJoin({
      gastoRes: this.http.get('/api/facturas/estadisticas/gastos', { headers, params }).pipe(
        timeout(10000),
        catchError(() => of({ stats: [] }))
      ),
      diaRes: this.http.get('/api/facturas/estadisticas/por-dia', { headers, params }).pipe(
        timeout(10000),
        catchError(() => of({ stats: [] }))
      ),
      usersRes: this.http.get<any[] | { users: any[] }>('/api/users', { headers, params }).pipe(
        timeout(10000),
        catchError(() => of([]))
      )
    })
      .pipe(finalize(() => {
        this.loading = false;
        if (this.loadingGuard) {
          clearTimeout(this.loadingGuard);
          this.loadingGuard = null;
        }
      }))
      .subscribe({
        next: ({ gastoRes, diaRes, usersRes }: any) => {
          this.porGasto = gastoRes?.stats || [];
          this.porDia = diaRes?.stats || [];

          const users = Array.isArray(usersRes) ? usersRes : (usersRes?.users || []);
          this.usuarios = users.length;

          this.barChartData = {
            labels: this.porGasto.map((g: any) => g._id),
            datasets: [
              {
                data: this.porGasto.map((g: any) => g.totalValor),
                label: 'Total Valor',
                backgroundColor: '#3b82f6',
                borderRadius: 8
              },
              {
                data: this.porGasto.map((g: any) => g.totalImpuesto),
                label: 'Total IVA',
                backgroundColor: '#f59e42',
                borderRadius: 8
              }
            ]
          };

          this.lineChartData = {
            labels: this.porDia.map((d: any) => d._id),
            datasets: [
              {
                data: this.porDia.map((d: any) => d.totalValor),
                label: 'Total Valor',
                fill: false,
                borderColor: '#3b82f6',
                tension: 0.3
              },
              {
                data: this.porDia.map((d: any) => d.totalFacturas),
                label: 'Total Facturas',
                fill: false,
                borderColor: '#f59e42',
                tension: 0.3
              }
            ]
          };

          if (this.usuarios === 0) {
            this.error = 'No se pudieron cargar las estadisticas. Reintentando...';
            this.scheduleRetry();
          } else {
            this.retryCount = 0;
          }
        },
        error: () => {
          this.error = 'Error al cargar el dashboard.';
          this.scheduleRetry();
        }
      });
  }
}
