# 🔗 GUÍA DE INTEGRACIÓN ANGULAR + BACKEND

## Paso 1: Actualizar el Servicio GastoService

### Ubicación: `frontend/src/app/services/gasto.ts`

Actualizar el contenido:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GastoService {
  private apiUrl = 'http://localhost:3000/api/facturas'; // Cambiar a URL del backend
  private gastos$ = new BehaviorSubject<any[]>([]);

  constructor(private http: HttpClient) {
    this.cargarGastos();
  }

  // ==========================================
  // OPERACIONES CRUD
  // ==========================================

  // Crear factura
  agregarGasto(datos: any): Observable<any> {
    const payload = {
      ruc: datos.ruc,
      valor: parseFloat(datos.valor),
      gasto: datos.tipoGasto,
      descripcion: `Factura ${datos.tipoGasto}`,
    };

    return this.http.post<any>(this.apiUrl, payload);
  }

  // Obtener todas las facturas
  obtenerGastos(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // Obtener por tipo de gasto
  obtenerGastosPorTipo(tipo: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/gasto/${tipo}`);
  }

  // Actualizar factura
  actualizarGasto(id: string, datos: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, datos);
  }

  // Eliminar factura
  eliminarGasto(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // ==========================================
  // MÉTODOS ADICIONALES
  // ==========================================

  // Cargar gastos al iniciar
  private cargarGastos(): void {
    this.obtenerGastos().subscribe({
      next: (response) => {
        if (response.success) {
          this.gastos$.next(response.data);
        }
      },
      error: (err) => console.error('Error cargando gastos:', err),
    });
  }

  // Obtener lista actual de gastos
  getGastosActuales(): any[] {
    return this.gastos$.value;
  }

  // Observable de gastos
  getGastos$(): Observable<any[]> {
    return this.gastos$.asObservable();
  }

  // Actualizar lista local
  recargarGastos(): void {
    this.cargarGastos();
  }
}
```

## Paso 2: Actualizar Componente Formulario

### Ubicación: `frontend/src/app/components/formulario/formulario.ts`

```typescript
import { Component, OnInit } from '@angular/core';
import { GastoService } from '../../services/gasto';

@Component({
  selector: 'app-formulario',
  templateUrl: './formulario.html',
  styleUrls: ['./formulario.css'],
})
export class Formulario implements OnInit {
  ruc: string = '';
  valor: number = 0;
  tipoGasto: string = '';
  tiposGasto = [
    { valor: 'Vivienda', etiqueta: 'Vivienda' },
    { valor: 'Salud', etiqueta: 'Salud' },
    { valor: 'Educación', etiqueta: 'Educación' },
  ];

  mostrarMensaje: boolean = false;
  mensajeError: string = '';
  mensajeExito: string = '';
  cargando: boolean = false;

  constructor(private gastoService: GastoService) {}

  ngOnInit(): void {}

  enviarDatos(): void {
    // Validar campos
    if (!this.ruc || !this.valor || !this.tipoGasto) {
      this.mostrarMensaje = true;
      this.mensajeError = 'Por favor complete todos los campos';
      setTimeout(() => (this.mostrarMensaje = false), 3000);
      return;
    }

    // Validar RUC (13 dígitos)
    if (!/^\d{13}$/.test(this.ruc)) {
      this.mostrarMensaje = true;
      this.mensajeError = 'RUC debe tener 13 dígitos';
      setTimeout(() => (this.mostrarMensaje = false), 3000);
      return;
    }

    // Validar valor > 0
    if (this.valor <= 0) {
      this.mostrarMensaje = true;
      this.mensajeError = 'El valor debe ser mayor a 0';
      setTimeout(() => (this.mostrarMensaje = false), 3000);
      return;
    }

    this.cargando = true;

    // Enviar al backend
    this.gastoService
      .agregarGasto({
        ruc: this.ruc,
        valor: this.valor,
        tipoGasto: this.tipoGasto,
      })
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.mostrarMensaje = true;
            this.mensajeExito = 'Factura registrada exitosamente';
            this.limpiarFormulario();
            this.gastoService.recargarGastos(); // Recargar lista
            setTimeout(() => (this.mostrarMensaje = false), 3000);
          }
          this.cargando = false;
        },
        error: (err) => {
          this.mostrarMensaje = true;
          this.mensajeError = err.error?.message || 'Error al guardar la factura';
          this.cargando = false;
          setTimeout(() => (this.mostrarMensaje = false), 3000);
        },
      });
  }

  limpiarFormulario(): void {
    this.ruc = '';
    this.valor = 0;
    this.tipoGasto = '';
  }

  borrarGasto(nombre: string): void {
    // Este método se puede actualizar si necesitas eliminar por nombre
    console.log('Eliminar:', nombre);
  }

  mostrarOcultarInfo(nombre: string): void {
    console.log('Mostrar info:', nombre);
  }
}
```

## Paso 3: Actualizar Componente Reporte

### Ubicación: `frontend/src/app/components/reporte/reporte.ts`

```typescript
import { Component, OnInit } from '@angular/core';
import { GastoService } from '../../services/gasto';

@Component({
  selector: 'app-reporte',
  templateUrl: './reporte.html',
  styleUrls: ['./reporte.css'],
})
export class Reporte implements OnInit {
  gastos: any[] = [];
  totalRegistros: number = 0;
  totalBase: number = 0;
  totalImpuesto: number = 0;
  cargando: boolean = false;

  constructor(private gastoService: GastoService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;

    this.gastoService.obtenerGastos().subscribe({
      next: (response) => {
        if (response.success) {
          this.gastos = response.data;
          this.totalRegistros = response.totalRegistros;
          this.totalBase = parseFloat(response.totalBase);
          this.totalImpuesto = parseFloat(response.totalImpuesto);
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando reportes:', err);
        this.cargando = false;
      },
    });
  }

  eliminarGasto(id: string): void {
    if (confirm('¿Está seguro de que desea eliminar esta factura?')) {
      this.gastoService.eliminarGasto(id).subscribe({
        next: (response) => {
          if (response.success) {
            console.log('Factura eliminada');
            this.cargarDatos(); // Recargar tabla
          }
        },
        error: (err) => console.error('Error eliminando:', err),
      });
    }
  }

  imprimir(): void {
    window.print();
  }

  // Método para formatear fecha
  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-EC');
  }

  // Método para formatear moneda
  formatearMoneda(valor: number): string {
    return `$${valor.toFixed(2)}`;
  }
}
```

## Paso 4: Actualizar HttpClientModule en AppModule

### Ubicación: `frontend/src/app/app-module.ts`

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'; // ← AGREGAR
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app';
import { AppRoutingModule } from './app-routing-module';
import { Menu } from './components/menu/menu';
import { Home } from './components/home/home';
import { Informacion } from './components/informacion/informacion';
import { Formulario } from './components/formulario/formulario';
import { Reporte } from './components/reporte/reporte';

@NgModule({
  declarations: [
    AppComponent,
    Menu,
    Home,
    Informacion,
    Formulario,
    Reporte,
  ],
  imports: [
    BrowserModule,
    HttpClientModule, // ← AGREGAR AQUÍ
    FormsModule,
    RouterModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

## Paso 5: Variables de Entorno (Opcional)

### Crear archivo `frontend/src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

### Crear archivo `frontend/src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-api.com/api'
};
```

### Usar en servicios:

```typescript
import { environment } from '../environments/environment';

export class GastoService {
  private apiUrl = `${environment.apiUrl}/facturas`;
  // ...
}
```

## Pruebas Recomendadas

### 1. Backend corriendo
```bash
cd backend
npm run dev
# Debe mostrar: "Servidor ejecutándose en puerto: 3000"
```

### 2. Frontend corriendo
```bash
cd frontend
ng serve
# Debe estar en: http://localhost:4200
```

### 3. Pruebas en el navegador

**A. Crear factura**
1. Ir a Registro
2. Llenar formulario
3. Presionar "Agregar Gasto"
4. Ver confirmación

**B. Ver en Reporte**
1. Ir a Reporte
2. Debe mostrar la factura creada
3. Ver totales calculados

**C. Eliminar factura**
1. En Reporte, presionar eliminar
2. Confirmar
3. La tabla se actualiza

## 🔍 Troubleshooting

| Problema | Causa | Solución |
|----------|-------|----------|
| CORS error | Backend no habilitado | Verificar CORS en server.js |
| 404 en POST | Ruta incorrecta | Verificar apiUrl en servicio |
| No conecta | Backend no corriendo | Ejecutar `npm run dev` en backend |
| Datos no guardan | MongoDB no conecta | Verificar MONGODB_URI en .env |
| Impuesto incorrecto | Cálculo en frontend | Confiar en cálculo del backend |

## 📝 Ejemplo Completo de Flujo

```
Usuario en Angular → Form
    ↓
Presiona "Agregar Gasto"
    ↓
Formula valida datos (RUC, valor, tipo)
    ↓
Envía POST a http://localhost:3000/api/facturas
    ↓
Backend valida y calcula impuesto (12%)
    ↓
MongoDB guarda documento
    ↓
Backend retorna respuesta success
    ↓
Angular muestra confirmación
    ↓
Reporte se actualiza con nuevos datos
    ↓
Usuario ve factura en tabla con impuesto calculado
```

## ✅ Checklist de Integración

- [ ] Backend instalado y corriendo (`npm run dev`)
- [ ] GastoService actualizado con apiUrl correcta
- [ ] HttpClientModule importado en AppModule
- [ ] Formulario enviando datos al backend
- [ ] Reporte cargando datos del backend
- [ ] CORS habilitado (debe funcionar sin errores)
- [ ] Impuestos calculándose correctamente (12%)
- [ ] Eliminar funcionando desde Reporte
- [ ] Datos persisten en MongoDB
- [ ] Errores manejados correctamente

---

¡Integración completada! 🎉
