import { Component, OnDestroy, OnInit } from '@angular/core';
import { GastoService } from '../../services/gasto';
import { NotificationService } from '../../services/notification';
import { Gasto } from '../../models/gasto';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { ImpuestoDataService, ImpuestoInput } from '../../services/impuesto-data';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-formulario',
  standalone: false,
  templateUrl: './formulario.html',
  styleUrl: './formulario.css'
})
export class FormularioComponent implements OnInit, OnDestroy {
  ruc: string = '';
  valor: number = 0;
  tipoGasto: string = '';

  mensajeError: string = '';
  mostrarMensaje: boolean = false;

  totalDeduccionAplicable: number = 0;
  baseImponibleEstimado: number = 0;
  impuestoEstimado: number = 0;

  readonly limiteGeneral = 15238.6;
  readonly limiteCategoria = 3809.65;
  readonly limiteSalud = 15238.6;

  private impuestoSub?: Subscription;

  tiposGasto = [
    { valor: 'Vivienda', etiqueta: 'Vivienda' },
    { valor: 'Salud', etiqueta: 'Salud' },
    { valor: 'Educacion', etiqueta: 'Educacion' }
  ];

  constructor(
    private gastoService: GastoService,
    private notificationService: NotificationService,
    private auth: AuthService,
    private router: Router,
    private impuestoDataService: ImpuestoDataService
  ) {}

  ngOnInit(): void {
    if (this.auth.isAdmin()) {
      this.notificationService.error('La cuenta admin no puede registrar facturas.');
      this.router.navigate(['/admin-dashboard']);
      return;
    }

    this.actualizarResumenFiscal(this.impuestoDataService.getData());
    this.impuestoSub = this.impuestoDataService.data$.subscribe((data) => {
      this.actualizarResumenFiscal(data);
    });
  }

  ngOnDestroy(): void {
    this.impuestoSub?.unsubscribe();
  }

  onInputChange(): void {
    if (this.mostrarMensaje) {
      this.mostrarMensaje = false;
      this.mensajeError = '';
    }
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
      impuestoCalculado: this.impuestoEstimado
    };

    this.gastoService.agregarNuevoGasto(nuevoGasto).subscribe({
      next: () => {
        this.notificationService.success(`Factura de $${this.valor.toFixed(2)} guardada en base de datos.`);
        this.mensajeError = '';
        this.mostrarMensaje = false;

        this.ruc = '';
        this.valor = 0;
        this.tipoGasto = '';
      },
      error: (err) => {
        if (err.error && err.error.message) {
          this.mensajeError = err.error.message;
        } else {
          this.mensajeError = 'Error: el servidor no responde o los datos son invalidos.';
        }
        this.notificationService.error(this.mensajeError);
        this.mostrarMensaje = true;
      }
    });
  }

  private validarFormulario(): boolean {
    this.mensajeError = '';

    if (!this.ruc || !/^[0-9]{13}$/.test(this.ruc)) {
      this.mensajeError = 'El RUC debe contener exactamente 13 digitos numericos.';
      return false;
    }

    if (typeof this.valor !== 'number' || isNaN(this.valor) || this.valor <= 0) {
      this.mensajeError = 'El valor debe ser un numero mayor a cero.';
      return false;
    }

    const tiposPermitidos = ['Vivienda', 'Salud', 'Educacion'];
    if (!this.tipoGasto || !tiposPermitidos.includes(this.tipoGasto)) {
      this.mensajeError = 'Debe seleccionar un tipo de gasto valido.';
      return false;
    }

    return true;
  }

  private actualizarResumenFiscal(data: ImpuestoInput | null): void {
    if (!data) {
      this.totalDeduccionAplicable = 0;
      this.baseImponibleEstimado = 0;
      this.impuestoEstimado = 0;
      return;
    }

    const totalDeduccion = Math.min(
      this.redondear(
        this.deduccionAplicable(data.deducciones.alimentacion, this.limiteCategoria) +
        this.deduccionAplicable(data.deducciones.vivienda, this.limiteCategoria) +
        this.deduccionAplicable(data.deducciones.educacionArteCultura, this.limiteCategoria) +
        this.deduccionAplicable(data.deducciones.vestimenta, this.limiteCategoria) +
        this.deduccionAplicable(data.deducciones.salud, this.limiteSalud)
      ),
      this.limiteGeneral
    );

    this.totalDeduccionAplicable = this.redondear(totalDeduccion);
    this.baseImponibleEstimado = this.redondear(Math.max(data.ingresoAnual - totalDeduccion, 0));
    this.impuestoEstimado = this.redondear(this.baseImponibleEstimado * 0.12);
  }

  private deduccionAplicable(valor: number, limite: number): number {
    return this.redondear(Math.min(Math.max(valor || 0, 0), limite));
  }

  private redondear(valor: number): number {
    return Math.round((valor + Number.EPSILON) * 100) / 100;
  }
}
