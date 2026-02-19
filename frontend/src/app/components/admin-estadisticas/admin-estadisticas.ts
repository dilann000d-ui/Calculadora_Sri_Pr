
import { Component, OnInit, ViewChild } from '@angular/core';
import { EstadisticasService } from '../../services/estadisticas';
import { AuthService } from '../../services/auth';

import Chart from 'chart.js/auto';


@Component({
  selector: 'app-admin-estadisticas',
  templateUrl: './admin-estadisticas.html',
  styleUrl: './admin-estadisticas.css',
  standalone: false
})
export class AdminEstadisticas implements OnInit {
  error = '';

  constructor(private estadisticas: EstadisticasService, private auth: AuthService) {}

  ngOnInit() {
    this.loadGastosChart();
    this.loadDiasChart();
  }

  loadGastosChart() {
    this.estadisticas.getPorGasto(this.auth.getToken()!).subscribe({
      next: (res) => {
        const ctx = document.getElementById('gastosChart') as HTMLCanvasElement;
        if (ctx) {
          new Chart(ctx, {
            type: 'pie',
            data: {
              labels: res.stats.map((s: any) => s._id),
              datasets: [{
                data: res.stats.map((s: any) => s.totalFacturas),
                backgroundColor: ['#fbbf24', '#38bdf8', '#34d399', '#f87171', '#a78bfa']
              }]
            },
            options: {
              plugins: {
                legend: { position: 'bottom' }
              }
            }
          });
        }
      },
      error: (err) => this.error = err.error?.message || 'Error al cargar estadísticas'
    });
  }

  loadDiasChart() {
    this.estadisticas.getPorDia(this.auth.getToken()!).subscribe({
      next: (res) => {
        const ctx = document.getElementById('diasChart') as HTMLCanvasElement;
        if (ctx) {
          new Chart(ctx, {
            type: 'bar',
            data: {
              labels: res.stats.map((s: any) => s._id),
              datasets: [{
                label: 'Facturas',
                data: res.stats.map((s: any) => s.totalFacturas),
                backgroundColor: '#38bdf8'
              }]
            },
            options: {
              plugins: {
                legend: { display: false }
              },
              scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: true }
              }
            }
          });
        }
      },
      error: (err) => this.error = err.error?.message || 'Error al cargar estadísticas'
    });
  }
}
