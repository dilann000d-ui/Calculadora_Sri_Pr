import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router'; 

import { Informacion } from './components/informacion/informacion';
import { FormularioComponent } from './components/formulario/formulario';
import { Reporte } from './components/reporte/reporte';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { AdminUsuarios } from './components/admin-usuarios/admin-usuarios';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard';

export const routes: Routes = [
  { path: 'informacion', component: Informacion },
  { path: 'registro', component: FormularioComponent },
  { path: 'reporte', component: Reporte },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: 'admin-usuarios', component: AdminUsuarios },
  { path: 'admin-estadisticas', component: AdminDashboardComponent },
  { path: '', redirectTo: '/informacion', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
