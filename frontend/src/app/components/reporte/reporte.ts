import { Component, OnInit } from '@angular/core';
import { GastoService } from '../../services/gasto';
import { Gasto } from '../../models/gasto';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-reporte',
  standalone: false,
  templateUrl: './reporte.html',
  styleUrl: './reporte.css'
})
export class Reporte implements OnInit {
  gastos: Gasto[] = [];

  constructor(private gastoService: GastoService, private auth: AuthService) {}

  ngOnInit(): void {
    this.cargarReporte();
  }

  cargarReporte(): void {
    const source$ = this.auth.isAdmin()
      ? this.gastoService.obtenerFacturasAdmin()
      : this.gastoService.obtenerMisFacturas();

    source$.subscribe({
      next: (res: any) => {
        // Adaptar el formato a Gasto[]
        this.gastos = (res.data || []).map((f: any) => ({
          id: f._id,
          ruc: f.ruc,
          tipoGasto: f.gasto,
          valor: f.valor,
          impuestoCalculado: f.impuesto
        }));
        console.log(`Gastos cargados (${this.auth.isAdmin() ? 'admin' : 'usuario'}):`, this.gastos);
      },
      error: (err) => {
        console.error('Error al cargar reporte:', err);
        this.gastos = [];
      }
    });
  }

  calcularTotal(): number {
    return this.gastos.reduce((total, gasto) => total + gasto.valor, 0);
  }

  calcularImpuestoTotal(): number {
    return this.gastos.reduce((total, gasto) => {
      const impuesto = gasto.impuestoCalculado || (gasto.valor * 0.12);
      return total + impuesto;
    }, 0);
  }

  obtenerColorTipo(tipo: string): string {
    const colores: { [key: string]: string } = {
      'Vivienda': 'bg-success',
      'Salud': 'bg-danger',
      'Alimentación': 'bg-warning',
      'Educación': 'bg-info',
      'Transporte': 'bg-primary',
      'Servicios Básicos': 'bg-secondary'
    };
    return colores[tipo] || 'bg-secondary';
  }

  exportarReporte(): void {
    // Función para exportar datos (puedes expandirla más adelante)
    console.log('Exporting report...', this.gastos);
    alert('Funcionalidad de exportación próximamente disponible');
  }

  imprimir(): void {
    // Función para imprimir o generar PDF
    window.print();
  }
}
