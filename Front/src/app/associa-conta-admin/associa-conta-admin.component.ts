import { Utils } from '../../utils';


import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
//import { BnAlertsService } from 'bndes-ux4';
import { jsPDF } from "jspdf";

import { Cliente, Subcredito } from '../shared/Cliente';
import { PessoaJuridicaService } from '../pessoa-juridica.service';
import { Web3Service } from './../Web3Service';
//import { Utils } from '../shared/utils';
import { DeclarationComponentInterface } from '../shared/declaration-component.interface';
import { FileHandleService } from '../file-handle.service';
import { AlertService } from '../_alert';

@Component({
  selector: 'app-associa-conta-admin',
  templateUrl: './associa-conta-admin.component.html',
  styleUrls: ['./associa-conta-admin.component.css']
})
export class AssociaContaAdminComponent implements OnInit {

  flagUploadConcluido: boolean;
  subcreditoSelecionado: number = 0;
  maskCnpj: any;
  cliente: Cliente;
  contaEstaValida: string;
  selectedAccount: any;
  hashdeclaracao: string;
  declaracao_titulo: string;
  declaracao_corpo: string;
  declaracao: string;
  uploadstart: boolean;
  load: boolean;
  disable: boolean;
  statusConta: boolean;

  loadButton = {};
  alertOptions = {
    autoClose: true,
    keepAfterRouteChange: false
};


  constructor(private pessoaJuridicaService: PessoaJuridicaService,
    private web3Service: Web3Service, private router: Router, private zone: NgZone, private ref: ChangeDetectorRef,
    public fileHandleService: FileHandleService, public alertService: AlertService) {

      let self = this;

      setInterval(function () {
        self.recuperaContaSelecionada(),
        1000});

      this.load = false;
      this.disable = true;
      this.uploadstart = false;
    }

  ngOnInit() {
    this.maskCnpj = Utils.getMaskCnpj();
    this.flagUploadConcluido = false;
    this.cliente = new Cliente();
    this.cliente.subcreditos = new Array<Subcredito>();

    if (this.selectedAccount != 0) {
      this.statusConta = true;
    } else {
      this.statusConta = false
    }
  }

  inicializaDadosDerivadosPessoaJuridica() {
    this.cliente.dadosCadastrais = undefined;
    this.subcreditoSelecionado = 0;
    this.hashdeclaracao = undefined;
    this.flagUploadConcluido = false;
    this.cliente.subcreditos = new Array<Subcredito>();
  }

  async changeCnpj() {

    this.cliente.cnpj = Utils.removeSpecialCharacters(this.cliente.cnpjWithMask);
    let cnpj = this.cliente.cnpj;
    this.inicializaDadosDerivadosPessoaJuridica();

    if ( cnpj.length == 14 ) {
      console.log (" Buscando o CNPJ do cliente (14 digitos fornecidos)...  " + cnpj)
      await this.recuperaClientePorCNPJ(cnpj);
      console.log("this.selectedAccount = " + this.selectedAccount + " | cnpj = " + cnpj);
      console.log(this.cliente.dadosCadastrais);

    }
    this.preparaUpload(this.cliente.cnpj, this.subcreditoSelecionado, this.selectedAccount, this);
  }

  changeContrato() {
    this.preparaUpload(this.cliente.cnpj, this.subcreditoSelecionado, this.selectedAccount, this);
  }

  preparaUpload(cnpj, contrato, selectedAccount, self) {
    if (this.uploadstart == true) {
      this.load=true;
      this.disable=false;
    }
    console.log("preapra upload");
    console.log("cnpj=" + cnpj);
    console.log("contrato=" + contrato);
    console.log("selectedAccount=" + selectedAccount);
    const tipo = "declaracao";

    if (cnpj  &&  selectedAccount) {
      this.fileHandleService.atualizaUploaderComponent(cnpj, contrato, selectedAccount, tipo, self);

      if (this.flagUploadConcluido == true) {
        this.load = false;
        this.disable = false;
      }
    }
  }

  cancelar() {
    this.cliente = new Cliente();

    this.inicializaDadosDerivadosPessoaJuridica();
  }

  async recuperaContaSelecionada() {

    let self = this;
    let newSelectedAccount = await this.web3Service.getCurrentAccountSync();
    if ( !self.selectedAccount || (newSelectedAccount !== self.selectedAccount && newSelectedAccount)) {
      if ( this.flagUploadConcluido == false ) {
        this.selectedAccount = newSelectedAccount;
        console.log("selectedAccount=" + this.selectedAccount);
        this.verificaEstadoContaBlockchainSelecionada(this.selectedAccount);
        this.preparaUpload(this.cliente.cnpj, this.subcreditoSelecionado, this.selectedAccount, this);
      }
      else {
        console.log( "Upload has already made! You should not change your account. Reseting... " );
        this.cancelar();
      }
    }

  }

  async verificaEstadoContaBlockchainSelecionada(contaBlockchainSelecionada) {

    let self = this;
    console.log("result contaBlockchainSelecionada=" + contaBlockchainSelecionada);

    if (contaBlockchainSelecionada) {
      let estadoConta = await this.web3Service.getEstadoContaAsString(contaBlockchainSelecionada);

        if (estadoConta){
          self.contaEstaValida = estadoConta
          console.log("result conta=" + estadoConta);

          setTimeout(() => {
            self.ref.detectChanges()
          }, 1000)
        } else {
          console.error("Erro ao verificar o estado da conta")
        }
  }

  }

  pedeEpreenchePDF(self, cnpj) {
    if (self.cliente.dadosCadastrais) {

      self.pessoaJuridicaService.pedeDeclaracao(cnpj, self.selectedAccount).subscribe(
        empresa => {
          console.log("associa...pedeDeclaracao(cnpj)");
          console.log(empresa);
          self.declaracao_titulo =  JSON.stringify(empresa.declaracao_titulo);
          self.declaracao_corpo =  JSON.stringify(empresa.declaracao_corpo);
        },
        error => {
          console.log("associa...pedeDeclaracao(cnpj)");
          console.log(error);
        }
      );

    } else {
        let texto = "CNPJ não encontrado na busca";
        self.alertService.error(texto, self.alertOptions);
    }
  }

  async recuperaClientePorCNPJ(cnpj) {

    console.log("RECUPERA CLIENTE com CNPJ = " + cnpj);

    let self = this;

    this.pessoaJuridicaService.recuperaClientePorCnpj(cnpj).subscribe(
      empresa => {
        if (empresa && empresa.dadosCadastrais) {
          console.log("empresa encontrada - ");
          console.log(empresa);
          this.inicializaDadosDerivadosPessoaJuridica();

          self.cliente.dadosCadastrais = empresa["dadosCadastrais"];

          for (var i = 0; i < empresa["subcreditos"].length; i++) {

            let subStr = JSON.parse(JSON.stringify(empresa["subcreditos"][i]));
            //self.includeAccountIfNoAssociated(self, cnpj, subStr);

          }
          self.pedeEpreenchePDF(self, cnpj);

        }
        else {
          //Do no clean fields to better UX
          let texto = "CNPJ não identificado";
          console.log(texto);
          self.alertService.error(texto, self.alertOptions);

        }
      },
      error => {
        let texto = "Erro ao buscar dados do cliente";
        console.log(texto);
        //Utils.criarAlertaErro( this.bnAlertsService, texto,error);
        self.alertService.error(texto, self.alertOptions);
        this.inicializaDadosDerivadosPessoaJuridica();
      });

  }

  includeAccountIfNoAssociated (self, cnpj, sub) {

    self.web3Service.getPJInfoByCnpj(cnpj, sub.numero,

      (pjInfo) => {

        if (pjInfo.isAssociavel) {
            self.includeIfNotExists(self.cliente.subcreditos, sub);

            if (!self.subcreditoSelecionado) {
              self.subcreditoSelecionado = self.cliente.subcreditos[0].numero;
              self.preparaUpload(self.cliente.cnpj, self.subcreditoSelecionado, self.selectedAccount, self);
            }
        }

      },
      (error) => {
        console.log("Erro ao verificar se contrato estah associado na blockhain");
        console.log(error);
      })

  }


  includeIfNotExists(subcreditos, sub) {

    let include = true;
    for(var i=0; i < subcreditos.length; i++) {
      if (subcreditos[i].numero==sub.numero) {
        include=false;
      }
    }
    if (include) subcreditos.push(sub);
  }

  async associarContaCliente() {
    console.log('associarContaAdministrador:: inicio')
    let self = this;

    if (this.hashdeclaracao==undefined || this.hashdeclaracao==null) {
      let s = "O envio da declaração é obrigatório";
      console.log(s);
      //this.bnAlertsService.criarAlerta("error", "Erro", s, 2)
      this.alertService.error(s, this.alertOptions);
      return
    }
    else if (!Utils.isValidHash(this.hashdeclaracao)) {
      let s = "O Hash da declaração está preenchido com valor inválido";
      console.log(s);
      //this.bnAlertsService.criarAlerta("error", "Erro", s, 2)
      this.alertService.error(s, this.alertOptions);
      return;
    }

    let result = await this.web3Service.isContaDisponivel(this.selectedAccount);

    if (!result) {
      let msg = "A conta "+ this.selectedAccount +" não está disponível para associação";
      this.alertService.error(msg, this.alertOptions);
    }
    else {

      this.web3Service.cadastra(parseInt(self.cliente.cnpj), self.hashdeclaracao).then(
        function(txHash) {
          self.alertService.success("Gravação concluída na Blockchain.", self.alertOptions);
          self.router.navigate(['home/associa/contas']);
        }
      , function(error) {
          self.alertService.error("Erro ao asssociar", self.alertOptions);
      });
      this.alertService.info("Confirme no metamask", this.alertOptions);
    }

  }

  createPdf(): void {
    let pdf = new jsPDF('p', 'pt', 'a4');
    let options = {
       pagesplit: true
    };
    console.log(pdf);

    const splitTitulo = pdf.splitTextToSize(this.declaracao_titulo, 540);
    pdf.text(splitTitulo,30,100);

    const splitCorpo = pdf.splitTextToSize(this.declaracao_corpo, 540);
    pdf.text(splitCorpo,30,200);

    pdf.save("declaracao_rbb_para_assinar.pdf");

 }



}
