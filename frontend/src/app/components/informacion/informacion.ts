import { Component, OnInit } from '@angular/core';

// Definimos la interfaz que representa la estructura JSON de cada gasto
interface Gasto {
    nombre: string;
    imagenUrl: string; 
}

@Component({
  selector: 'app-informacion',
  standalone: false,
  templateUrl: './informacion.html',
  styleUrl: './informacion.css',
})
export class Informacion implements OnInit {
  
  
  gastos: Gasto[] = []; 
  
  gastoSeleccionado: string | null = null; 

  constructor() { }

  ngOnInit(): void {
   
    this.gastos = [
      { 
        "nombre": "Vivienda", 
        "imagenUrl": "../vivienda.png" 
      }, 
      { 
        "nombre": "Salud", 
        "imagenUrl": "../salud.png"
      },
      { 
        "nombre": "Educación", 
        "imagenUrl": "../educacion.png"
      },
    ];
    
    
  }

  
  mostrarOcultarInfo(tipoGasto: string): void {
    if (this.gastoSeleccionado === tipoGasto) {
      this.gastoSeleccionado = null; 
    } else {
      this.gastoSeleccionado = tipoGasto; 
    }
  }

  /**
   * Elimina un gasto de la lista.
   */
  borrarGasto(gastoABorrar: string): void {
    this.gastos = this.gastos.filter(g => g.nombre !== gastoABorrar);
    
    if (this.gastoSeleccionado === gastoABorrar) {
      this.gastoSeleccionado = null;
    }
  }
}