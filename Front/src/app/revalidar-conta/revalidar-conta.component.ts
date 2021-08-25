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
  selector: 'app-revalidar-conta',
  templateUrl: './revalidar-conta.component.html',
  styleUrls: ['./revalidar-conta.component.css']
})
export class RevalidarContaComponent implements OnInit {

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
  disableRegular: boolean;
  statusConta: boolean;
  estadoConta: string;

  contaAdminFlag: boolean;
  loadButton = {};
  alertOptions = {
    autoClose: true,
    keepAfterRouteChange: false
};


  constructor(private pessoaJuridicaService: PessoaJuridicaService,
    private web3Service: Web3Service, private router: Router, private zone: NgZone, private ref: ChangeDetectorRef,
    public fileHandleService: FileHandleService, public alertService: AlertService) {

      let self = this;
      
      setTimeout(() => {      
        setInterval(function () {
          self.recuperaContaSelecionada(),
          1000});
      }, 2030);
      /*  
      setInterval(function () {
        self.checkCadastro(),
        1000});
*/
      this.load = false;
      this.disable = true;
      this.disableRegular = true;
      this.uploadstart = false;
      this.statusConta = false;
    }

  ngOnInit() {
    this.maskCnpj = Utils.getMaskCnpj();
    this.flagUploadConcluido = false;
    this.cliente = new Cliente();
    this.cliente.subcreditos = new Array<Subcredito>();
  }

  inicializaDadosDerivadosPessoaJuridica() {
    this.cliente.dadosCadastrais = undefined;
    this.subcreditoSelecionado = 0;
    this.hashdeclaracao = undefined;
    this.flagUploadConcluido = false;
    this.cliente.subcreditos = new Array<Subcredito>();
  }

 /*async changeCnpj() {

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
  }*/

  changeContrato() {
    this.preparaUpload(this.cliente.cnpj, this.subcreditoSelecionado, this.selectedAccount, this);
  }

  preparaUpload(cnpj, contrato, selectedAccount, self) {

    console.log("preapra upload");
    console.log("cnpj=" + cnpj);
    console.log("contrato=" + contrato);
    console.log("selectedAccount=" + selectedAccount);
    const tipo = "declaracao";

    if (cnpj  &&  selectedAccount) {
      this.fileHandleService.atualizaUploaderComponent(cnpj, contrato, selectedAccount, tipo, self);
    }
  }
  async checkCadastro(){
    if (this.uploadstart == true) {
      if (this.flagUploadConcluido == true && this.hashdeclaracao != undefined) {
        this.load = false;
        this.disable = false;
        this.uploadstart = false;
      } else {
        this.disable = false;
        this.load = true;
      }
    };
    let estadoConta = await this.web3Service.getEstadoContaAsString(this.selectedAccount);

    if (this.selectedAccount != 0 && estadoConta =='Disponível') {
      this.statusConta = true;
    } else {
      this.statusConta = false;
    }
  }

  cancelar() {
    this.cliente = new Cliente();

    this.inicializaDadosDerivadosPessoaJuridica();
  }



  async recuperaContaSelecionada() {

    let self = this;
    let newSelectedAccount = await this.web3Service.getCurrentAccountSync();
    if(newSelectedAccount === undefined){
      this.statusConta =false;
      this.contaEstaValida="";
      self.selectedAccount = undefined;
      return;
    }
    if ( !self.selectedAccount || (newSelectedAccount !== self.selectedAccount && newSelectedAccount)) {
      //if ( this.flagUploadConcluido == false ) {
        this.selectedAccount = newSelectedAccount;
        
        this.verificaEstadoContaBlockchainSelecionada(this.selectedAccount);
        let registro = await this.web3Service.getPJInfo(this.selectedAccount);
        console.log("registro.status: "+ registro.status);
        console.log("selectedAccount=" + this.selectedAccount);
        
        if(registro.role==1){
          
          this.contaAdminFlag=true;
        }
        else{
          this.contaAdminFlag=false;
        }
        let status = this.web3Service.getEstadoContaAsStringByCodigo(registro.status);
        
        if(status !="Invalidada" && status != "Disponível"){
          this.cliente.cnpj = registro.cnpj;
          this.statusConta=true;
          this.inicializaDadosDerivadosPessoaJuridica();
          await this.recuperaClientePorCNPJ( Utils.removeSpecialCharacters(this.cliente.cnpj));

          this.disableRegular=false;
          
          console.log("this.selectedAccount: "+ this.selectedAccount);
          console.log("this.cliente.cnp: "+ this.cliente.cnpj);
          console.log("this.cliente.dadosCadastrais.razaoSocial: "+ this.cliente.dadosCadastrais);
          console.log("registro.status: "+ (this.web3Service.getEstadoContaAsStringByCodigo(registro.status)));
          

        }else{
          this.statusConta=false;
          let texto = "Conta nao Valida";
          this.cliente.dadosCadastrais.razaoSocial="";
          self.alertService.error(texto, self.alertOptions);
        }
        this.preparaUpload(this.cliente.cnpj, this.subcreditoSelecionado, this.selectedAccount, this);
        
        //}
      /*else {
        console.log( "Upload has already made! You should not change your account. Reseting... " );
        this.cancelar();
      }*/
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

    this.pessoaJuridicaService.recuperaEmpresaPorCnpj(cnpj).subscribe(
      empresa => {
        
        if (empresa && empresa.dadosCadastrais) {
          
          console.log("empresa encontrada - ");
          console.log(empresa);
          this.inicializaDadosDerivadosPessoaJuridica();
          
          self.cliente.dadosCadastrais = empresa["dadosCadastrais"];
          console.log(self.cliente.dadosCadastrais.razaoSocial);
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
  async reativarContaClienteRegular() {
    console.log('associarContaRegular:: inicio')
    let self = this;
     
    let registro = await this.web3Service.getPJInfo(this.selectedAccount);
    if(registro.role != 0){
      let msg = "a conta precisa ser regular";
          this.alertService.error(msg, this.alertOptions);
    }
    let status = this.web3Service.getEstadoContaAsStringByCodigo(registro.status)
        if(status =="Invalidada" || status == "Disponível"){
          let msg = "A conta "+ this.selectedAccount +" não está disponível para associação";
          this.alertService.error(msg, this.alertOptions);
        }
    else {
      this.hashdeclaracao = "0";
      this.web3Service.ReValidarRegular(parseInt(self.cliente.cnpj), self.hashdeclaracao).then(
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
  async reativarContaClienteAdmin(){
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
    let registro = await this.web3Service.getPJInfo(this.selectedAccount);
    let status = this.web3Service.getEstadoContaAsStringByCodigo(registro.status)
        if(status =="Invalidada" || status == "Disponível"){
          let msg = "A conta "+ this.selectedAccount +" não está disponível para associação";
          this.alertService.error(msg, this.alertOptions);
        }
        else {

          this.web3Service.ReValidarAdmin(parseInt(self.cliente.cnpj), self.hashdeclaracao).then(
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

/*
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
*/
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
