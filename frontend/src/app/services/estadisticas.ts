import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EstadisticasService {
  private apiUrl = '/api/facturas/estadisticas';

  constructor(private http: HttpClient) {}

  getPorGasto(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/gastos`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  getPorDia(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/por-dia`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}
