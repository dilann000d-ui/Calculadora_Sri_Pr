
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Gasto } from '../models/gasto';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth';

@Injectable({ providedIn: 'root' })
export class GastoService {
  // 1. CAMBIO: Usa la IP de tu servidor de AWS
  // private API_URL = 'http://13.59.191.40:3000/api/facturas';
  // Usa la ruta relativa para desarrollo local con proxy:
  private API_URL = 'http://13.59.191.40:3000/api/facturas';

  constructor(private http: HttpClient, private auth: AuthService) {}

  // 2. CAMBIO: Ahora obtiene los datos desde MongoDB vía AWS
  obtenerDatos(): Observable<Gasto[]> {
    return this.http.get<any>(this.API_URL).pipe(
      map(res => {
        // Adaptamos el formato que devuelve tu backend al formato que usa tu interfaz Gasto
        return res.data.map((f: any) => ({
          id: f._id,
          ruc: f.ruc,
          tipoGasto: f.gasto,
          valor: f.valor,
          impuestoCalculado: f.impuesto
        }));
      })
    );
  }

  // 3. CAMBIO: Ahora envía el gasto real al servidor para que se guarde en MongoDB
  agregarNuevoGasto(gasto: Gasto): Observable<any> {
    const facturaParaBackend = {
      ruc: gasto.ruc,
      valor: gasto.valor,
      gasto: gasto.tipoGasto,
      descripcion: 'Factura desde la web'
    };
    const token = this.auth.getToken();
    const headers = token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : {};
    return this.http.post(this.API_URL, facturaParaBackend, headers);
  }

  // 4. CAMBIO: Para eliminar, necesitas el ID de MongoDB
  eliminarGasto(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  // Obtener facturas del usuario autenticado
  obtenerMisFacturas(): Observable<any> {
    const token = this.auth.getToken();
    const headers = token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : {};
    return this.http.get(`${this.API_URL}/mis-facturas`, headers);
  }

  // Obtener todas las facturas (vista admin)
  obtenerFacturasAdmin(): Observable<any> {
    const token = this.auth.getToken();
    const headers = token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : {};
    return this.http.get(this.API_URL, headers);
  }
}
