import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginScreenComponent } from './screens/login-screen/login-screen.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { RegistroUsuariosScreenComponent } from './screens/registro-usuarios-screen/registro-usuarios-screen.component';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';
import { AdminScreenComponent } from './screens/admin-screen/admin-screen.component';
import { AlumnosScreenComponent } from './screens/alumnos-screen/alumnos-screen.component';
import { HomeScreenComponent } from './screens/home-screen/home-screen.component';
import { MaestrosScreenComponent } from './screens/maestros-screen/maestros-screen.component';
import { GraficasScreenComponent } from './screens/graficas-screen/graficas-screen.component';

const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginScreenComponent },
      { path: 'registro-usuarios', component: RegistroUsuariosScreenComponent },
      { path: 'registro-usuarios/:rol/:id', component: RegistroUsuariosScreenComponent }
    ]
  },
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      { path: 'home', component: HomeScreenComponent },
      { path: 'administrador', component: AdminScreenComponent },
      { path: 'alumnos', component: AlumnosScreenComponent },
      { path: 'maestros', component: MaestrosScreenComponent },
      { path: 'graficas', component: GraficasScreenComponent },
      
      // Lista de eventos (visible para todos los roles logueados)
      // { path: 'eventos-academicos', component: EventosScreenComponent },
      
      // Registro de eventos (solo admin, validaremos rol dentro del componente o guard)
      // { path: 'registro-eventos', component: RegistroEventosScreenComponent },
      // { path: 'registro-eventos/:id', component: RegistroEventosScreenComponent },
    ]
  },
  // fallback route
  { path: '**', redirectTo: 'login' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
