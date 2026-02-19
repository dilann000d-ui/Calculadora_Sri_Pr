import { Component, OnInit } from '@angular/core';
import { GastoService } from '../../services/gasto';
import { Gasto } from '../../models/gasto';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  gastosDeducibles: Gasto[] = [];

  constructor(private gastoService: GastoService) {}

  ngOnInit(): void {
    this.cargarGastos();
  }

  cargarGastos(): void {
    this.gastoService.obtenerDatos().subscribe({
      next: (datos) => {
        this.gastosDeducibles = datos;
      },
      error: (err) => {
        console.error('Error al cargar gastos:', err);
        this.gastosDeducibles = [];
      }
    });
  }

  eliminarGasto(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este gasto?')) {
      this.gastoService.eliminarGasto(id.toString());
      this.cargarGastos();
    }
  }

  calcularTotalGastos(): number {
    return this.gastosDeducibles.reduce((total, gasto) => total + gasto.valor, 0);
  }
}
