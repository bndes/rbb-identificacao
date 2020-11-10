import { Component, OnInit } from '@angular/core';
import { Utils } from '../../utils';
import { Cliente, Subcredito } from './Cliente';


@Component({
  selector: 'app-associa-conta-admin',
  templateUrl: './associa-conta-admin.component.html',
  styleUrls: ['./associa-conta-admin.component.css']
})
export class AssociaContaAdminComponent implements OnInit {

  flagUploadConcluido: boolean;
  maskCnpj: any;
  cliente: Cliente;
  contaEstaValida: string;
  selectedAccount: any;
  hashdeclaracao: string;
  declaracao: string;
  
  constructor() { }

  ngOnInit() {
    this.maskCnpj = Utils.getMaskCnpj();
    this.flagUploadConcluido = false;
    this.cliente = new Cliente();
    this.cliente.subcreditos = new Array<Subcredito>();
  }

  

}
