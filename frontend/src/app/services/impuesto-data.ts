import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ImpuestoInput {
  cedula: string;
  ingresoAnual: number;
  deducciones: {
    alimentacion: number;
    vivienda: number;
    educacionArteCultura: number;
    vestimenta: number;
    salud: number;
  };
  totalDeduccion: number;
}

@Injectable({ providedIn: 'root' })
export class ImpuestoDataService {
  private readonly storageKey = 'impuesto_form_data_2023';
  private readonly dataSubject = new BehaviorSubject<ImpuestoInput | null>(this.loadFromStorage());
  readonly data$ = this.dataSubject.asObservable();

  setData(data: ImpuestoInput): void {
    this.dataSubject.next(data);
    localStorage.setItem(this.storageKey, JSON.stringify(data, null, 2));
  }

  getData(): ImpuestoInput | null {
    return this.dataSubject.value;
  }

  getStoredJson(): string {
    const data = this.getData();
    return data ? JSON.stringify(data, null, 2) : '{}';
  }

  private loadFromStorage(): ImpuestoInput | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as ImpuestoInput;
    } catch {
      return null;
    }
  }
}
