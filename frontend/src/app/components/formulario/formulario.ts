import { Component, OnInit } from '@angular/core';
import { GastoService } from '../../services/gasto'; // Verifica la ruta
import { NotificationService } from '../../services/notification';
import { Gasto } from '../../models/gasto';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-formulario',
  standalone: false,
  templateUrl: './formulario.html',
  styleUrl: './formulario.css'
})
export class FormularioComponent implements OnInit {
  ruc: string = '';
  valor: number = 0;
  tipoGasto: string = '';
  
  mensajeError: string = '';
  mensajeExito: string = '';
  mostrarMensaje: boolean = false;

  // Deben coincidir con el 'enum' de tu modelo en el Backend
  tiposGasto = [
    { valor: 'Vivienda', etiqueta: 'Vivienda' },
    { valor: 'Salud', etiqueta: 'Salud' },
    { valor: 'Educación', etiqueta: 'Educación' }
    // Nota: 'Alimentación' y otros deben estar en el enum de Factura.js o darán error 400
  ];

  constructor(
    private gastoService: GastoService,
    private notificationService: NotificationService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.auth.isAdmin()) {
      this.notificationService.error('La cuenta admin no puede registrar facturas.');
      this.router.navigate(['/admin-dashboard']);
    }
  }

  validarRUC(ruc: string): boolean {
    return /^\d{13}$/.test(ruc);
  }

  // Resetear mensaje cuando el usuario empieza a escribir
  onInputChange(): void {
    if (this.mostrarMensaje) {
      this.mostrarMensaje = false;
      this.mensajeError = '';
    }
  }

  validarFormulario(): boolean {
    this.mensajeError = '';
    this.mensajeExito = '';

    // Validar RUC
    if (!this.ruc || typeof this.ruc !== 'string' || !/^[0-9]{13}$/.test(this.ruc)) {
      this.mensajeError = 'El RUC debe contener exactamente 13 dígitos numéricos.';
      return false;
    }
    // Validar valor
    if (typeof this.valor !== 'number' || isNaN(this.valor) || this.valor <= 0) {
      this.mensajeError = 'El valor debe ser un número mayor a cero.';
      return false;
    }
    // Validar tipo de gasto
    const tiposPermitidos = ['Vivienda', 'Salud', 'Educación'];
    if (!this.tipoGasto || !tiposPermitidos.includes(this.tipoGasto)) {
      this.mensajeError = 'Debe seleccionar un tipo de gasto válido.';
      return false;
    }
    return true;
  }

  enviarDatos(): void {
    if (!this.validarFormulario()) {
      this.mostrarMensaje = true;
      return;
    }

    const nuevoGasto: Gasto = {
      id: 0, 
      ruc: this.ruc,
      tipoGasto: this.tipoGasto,
      valor: this.valor,
      impuestoCalculado: 0 
    };

    this.gastoService.agregarNuevoGasto(nuevoGasto).subscribe({
      next: (res) => {
        this.notificationService.success(`✓ Factura de $${this.valor} guardada exitosamente en la base de datos.`);
        this.mensajeExito = '';
        this.mensajeError = '';
        this.mostrarMensaje = false;
        
        // Limpiar campos
        this.ruc = '';
        this.valor = 0;
        this.tipoGasto = '';
      },
      error: (err) => {
        console.error('Error AWS/Mongo:', err);
        // Mostrar mensaje detallado del backend si existe
        if (err.error && err.error.message) {
          this.mensajeError = err.error.message;
        } else {
          this.mensajeError = 'Error: El servidor no responde o los datos son inválidos.';
        }
        this.notificationService.error(this.mensajeError);
        this.mostrarMensaje = true;
      }
    });
  }
}
