import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MenuComponent } from './components/menu/menu.component';
import { MaterialModule } from 'src/material.module';
import { FooterComponent } from './components/footer/footer.component';
import { TemplateComponent } from './template/template.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { AssociaContaAdminComponent } from './associa-conta-admin/associa-conta-admin.component';
import { AssociaContaClienteComponent } from './associa-conta-cliente/associa-conta-cliente.component';
import { ListacontasComponent } from './listacontas/listacontas.component';
import { ValidarContaAdminComponent } from './validar-conta-admin/validar-conta-admin.component';
import { HomeComponent } from './home/home.component';
import { CallComponent } from './call/call.component';
import { AlertModule } from './_alert';
import { NgxMaskModule, IConfig } from 'ngx-mask'
import { NgxTippyModule } from 'ngx-tippy-wrapper';
import {APP_BASE_HREF} from '@angular/common';

/* Services */
import { Web3Service } from './Web3Service';
import { PessoaJuridicaService } from './pessoa-juridica.service';
import { FileHandleService } from './file-handle.service';
import { ConstantesService } from './ConstantesService';
import { GoogleMapsService } from './shared/google-maps.service';

import { FileUploadModule } from 'ng2-file-upload';
import { RevalidarContaComponent } from './revalidar-conta/revalidar-conta.component';


export const options: Partial<IConfig> | (() => Partial<IConfig>) = null;



@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    FooterComponent,
    TemplateComponent,
    AssociaContaAdminComponent,
    AssociaContaClienteComponent,
    ListacontasComponent,
    ValidarContaAdminComponent,
    HomeComponent,
    CallComponent,
    RevalidarContaComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    FileUploadModule,
    AlertModule,
    NgxMaskModule.forRoot(),
    NgxTippyModule
  ],
  providers: [PessoaJuridicaService, Web3Service, ConstantesService, GoogleMapsService, FileHandleService 
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }


/*
  providers: [PessoaJuridicaService, Web3Service, ConstantesService, GoogleMapsService, FileHandleService ,
    {provide: APP_BASE_HREF, useValue: '/identificacao/'}
  ],
*/