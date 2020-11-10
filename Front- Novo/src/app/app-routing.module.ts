import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TemplateComponent } from './template/template.component';
import { AssociaContaAdminComponent } from './associa-conta-admin/associa-conta-admin.component';
import { AssociaContaClienteComponent } from './associa-conta-cliente/associa-conta-cliente.component';
import { ListacontasComponent } from './listacontas/listacontas.component';
import { ValidarContaAdminComponent } from './validar-conta-admin/validar-conta-admin.component';
import { PauseClienteComponent } from './pause-cliente/pause-cliente.component';
import { PauseAdminComponent } from './pause-admin/pause-admin.component';

const routes: Routes = [
  { path: 'home', component: TemplateComponent,
    children: [
      {
        path: 'associa/admin', component: AssociaContaAdminComponent
      },
      {
        path: 'associa/cliente', component: AssociaContaClienteComponent
      },
      {
        path: 'associa/contas', component: ListacontasComponent
      },
      {
        path: 'validar', component: ValidarContaAdminComponent
      },
      {
        path: 'pause/cliente', component: PauseClienteComponent
      },
      {
        path: 'pause/admin', component: PauseAdminComponent
      }
    ]
  },
  {
    path: '', component: TemplateComponent
  }
  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
