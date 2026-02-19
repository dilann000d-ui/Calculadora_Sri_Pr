import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  cargando = false;
  errorCarga = '';

  constructor(
    private gastoService: GastoService,
    public auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarReporte();
  }

  cargarReporte(): void {
    this.cargando = true;
    this.errorCarga = '';
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
        setTimeout(() => {
          this.cargando = false;
          this.cdr.detectChanges();
        }, 0);
        console.log(`Gastos cargados (${this.auth.isAdmin() ? 'admin' : 'usuario'}):`, this.gastos);
      },
      error: (err) => {
        console.error('Error al cargar reporte:', err);
        this.errorCarga = err?.error?.message || 'No se pudo cargar el reporte.';
        this.gastos = [];
        setTimeout(() => {
          this.cargando = false;
          this.cdr.detectChanges();
        }, 0);
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

  calcularPromedio(): number {
    if (!this.gastos.length) {
      return 0;
    }
    return this.calcularTotal() / this.gastos.length;
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
