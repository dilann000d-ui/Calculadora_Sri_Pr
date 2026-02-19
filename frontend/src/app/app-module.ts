
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing-module';


import { App } from './app';
import { NgApexchartsModule } from 'ng-apexcharts';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard';
import { Informacion } from './components/informacion/informacion';
import { FormularioComponent } from './components/formulario/formulario';
import { Menu } from './components/menu/menu';
import { Reporte } from './components/reporte/reporte';
import { Home } from './components/home/home';
import { NotificationComponent } from './components/notification/notification';
import { AdminEstadisticas } from './components/admin-estadisticas/admin-estadisticas';
import { AdminUsuarios } from './components/admin-usuarios/admin-usuarios';
import { Login } from './components/login/login';
import { Register } from './components/register/register';

@NgModule({
  declarations: [
    App,
    Informacion,
    FormularioComponent,
    Reporte,
    Home,
    AdminEstadisticas,
    AdminUsuarios,
    Login,
    Register
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NotificationComponent,
    RouterModule,
    NgApexchartsModule,
    Menu,
    AdminDashboardComponent
  ],
  providers: [],
  bootstrap: [App]
})
export class AppModule { }
