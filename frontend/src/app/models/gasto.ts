// src/app/models/gasto.ts
export interface Gasto {
  id: number;
  ruc: string;
  tipoGasto: string;
  valor: number;
  impuestoCalculado?: number;
}