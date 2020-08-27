import { LoginrbbComponent } from './loginrbb/loginrbb.component';
import { HomeComponent } from './home/home.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MenuComponent } from './components/menu/menu.component';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/material.module';
import { FooterComponent } from './components/footer/footer.component';
import { TabelaComponent } from './components/tabela/tabela.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TemplateComponent } from './template/template.component';




@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginrbbComponent,
    MenuComponent,
    FooterComponent,
    TabelaComponent,
    SidebarComponent,
    TemplateComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
