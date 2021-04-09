import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TemplateComponent } from './template/template.component';
import { AssociaContaAdminComponent } from './associa-conta-admin/associa-conta-admin.component';
import { AssociaContaClienteComponent } from './associa-conta-cliente/associa-conta-cliente.component';
import { ListacontasComponent } from './listacontas/listacontas.component';
import { ValidarContaAdminComponent } from './validar-conta-admin/validar-conta-admin.component';
import { HomeComponent } from './home/home.component';
import { CallComponent } from './call/call.component';
import { RevalidarContaComponent } from './revalidar-conta/revalidar-conta.component';

const routes: Routes = [
  { path: '', component: TemplateComponent,
    children: [
      {
        path: 'home/associa/admin', component: AssociaContaAdminComponent
      },
      {
        path: 'home/associa/regular', component: AssociaContaClienteComponent
      },
      {
        path: 'home/associa/contas', component: ListacontasComponent
      },
      {
        path: 'home/revalidar/contas', component: RevalidarContaComponent
      },
      {
        path: 'home/validar', component: ValidarContaAdminComponent
      },
      {
        path: 'home', component: HomeComponent
      },
      {
        path: '', component: CallComponent
      }
    ]
  }
  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
