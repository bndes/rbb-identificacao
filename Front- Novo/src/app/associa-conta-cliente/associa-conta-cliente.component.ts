import { Component, OnInit } from '@angular/core';
import { Utils } from '../../utils';
import { Cliente, Subcredito } from '../associa-conta-admin/Cliente';

@Component({
  selector: 'app-associa-conta-cliente',
  templateUrl: './associa-conta-cliente.component.html',
  styleUrls: ['./associa-conta-cliente.component.css']
})
export class AssociaContaClienteComponent implements OnInit {

  flagUploadConcluido: boolean;
  maskCnpj: any;
  cliente: Cliente;
  contaEstaValida: string;
  selectedAccount: any;
  hashdeclaracao: string;
  declaracao: string;

  constructor() { }

  ngOnInit(){
    this.maskCnpj = Utils.getMaskCnpj();
    this.flagUploadConcluido = false;
    this.cliente = new Cliente();
    this.cliente.subcreditos = new Array<Subcredito>();
  }

}
