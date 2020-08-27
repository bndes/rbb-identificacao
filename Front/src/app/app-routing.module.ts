import { TabelaComponent } from './components/tabela/tabela.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginrbbComponent } from './loginrbb/loginrbb.component';
import { AppComponent } from './app.component';
import { TemplateComponent } from './template/template.component';

const routes: Routes = [
  { path: 'home', component: TemplateComponent,
    children: [
      {
        path: 'logingov', component: HomeComponent,
      },
      {
        path: 'loginrbb', component: LoginrbbComponent,
      },
      {
        path: 'vinculos', component: TabelaComponent,
      }
    ]
  }
  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
