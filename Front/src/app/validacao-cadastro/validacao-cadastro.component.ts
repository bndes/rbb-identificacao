import { Component, OnInit, NgZone  } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import {FileHandleService} from "../file-handle.service";
import { Web3Service } from './../Web3Service';
import { PessoaJuridicaService } from '../pessoa-juridica.service';
import { PessoaJuridica } from '../PessoaJuridica';
import { BnAlertsService } from 'bndes-ux4';
import { Router } from '@angular/router';
import { Utils } from '../shared/utils';
import { ConstantesService } from '../ConstantesService';

@Component({
  selector: 'app-validacao-cadastro',
  templateUrl: './validacao-cadastro.component.html',
  styleUrls: ['./validacao-cadastro.component.css']
})
export class ValidacaoCadastroComponent implements OnInit {

  pj: PessoaJuridica;
  isHashInvalido: boolean = false;
  selectedAccount: any;
  contaBuscadaENaoAssociada: boolean = false;
  urlArquivo = "";

  constructor(private pessoaJuridicaService: PessoaJuridicaService, 
      private fileHandleService: FileHandleService,
      protected bnAlertsService: BnAlertsService, private web3Service: Web3Service,
      private router: Router, private ref: ChangeDetectorRef, private zone: NgZone) {

        let self = this;
        setInterval(function () {
          self.recuperaContaSelecionada(), 1000});
  
  }

  ngOnInit() {   
    this.pj = {
      id: -1,
      cnpj: "",
      razaoSocial: "",
      idSubcredito: "",
      contaBlockchain: "",
      hashDeclaracao: "",
      filePathAndName: "",
      dadosBancarios: undefined,
      status: status
   };
  }

  recuperaClientePorContaBlockchain(conta) {
    let self = this;    
    self.contaBuscadaENaoAssociada = false;

    if ( conta != undefined && conta != "" && conta.length == 42 ) {

      console.log("#### conta a recuperar PJInfo " + conta);      
      self.web3Service.getPJInfo(conta,
          (result) => {

            if ( result.cnpj != 0 ) { //encontrou uma PJ valida  

              console.log("#### result da validacao cadastro da conta " + conta);
              console.log(result);
              self.pj.cnpj = result.cnpj;
              self.pj.idSubcredito = result.idSubcredito;
              self.pj.hashDeclaracao = result.hashDeclaracao;
              self.pj.status = self.web3Service.getEstadoContaAsStringByCodigo(result.status);

              this.pessoaJuridicaService.recuperaEmpresaPorCnpj(self.pj.cnpj).subscribe(
                empresa => {
                  if (empresa && empresa.dadosCadastrais) {
                    self.pj.razaoSocial = empresa.dadosCadastrais.razaoSocial;
                  }
                  else {
                    let texto = "Nenhuma empresa encontrada associada ao CNPJ";
                    console.log(texto);
                    Utils.criarAlertaAcaoUsuario( this.bnAlertsService, texto);       
                  }
              },
              error => {
                let texto = "Erro ao buscar dados da empresa";
                console.log(texto);
                Utils.criarAlertaErro( this.bnAlertsService, texto,error);
              }) //fecha busca PJInfo

              this.fileHandleService.buscaFileInfo(self.pj.cnpj, self.pj.idSubcredito, self.pj.contaBlockchain, 
                self.pj.hashDeclaracao, "declaracao").subscribe(
                result => {
                  if (result && result.pathAndName) {
                    self.pj.filePathAndName=ConstantesService.serverUrlRoot+result.pathAndName;
                  }
                  else {
                    let texto = "Não foi possível encontrar informações associadas ao arquivo desse cadastro.";
                    console.log(texto);
                    Utils.criarAlertaAcaoUsuario( this.bnAlertsService, texto);       
                  }                  
                }, 
                error => {
                  let texto = "Erro ao buscar dados de arquivo";
                  console.log(texto);
                  Utils.criarAlertaErro( this.bnAlertsService, texto,error);
                }) //fecha busca fileInfo
  

           } //fecha if de PJ valida

           else {
            self.contaBuscadaENaoAssociada = true;
            let texto = "Nenhuma empresa encontrada associada a conta blockchain";
            console.log(texto);
            Utils.criarAlertaAcaoUsuario( this.bnAlertsService, texto);       
            self.apagaCamposDaEstrutura();
           }
           
          },
          (error) => {
            self.apagaCamposDaEstrutura();
            console.warn("Erro ao buscar dados da conta na blockchain")
          })
    } 
    else {
        self.apagaCamposDaEstrutura();      
    }
}

  estaContaEstadoAguardandoValidacao() {
    if (this.pj && this.pj.status == "Aguardando validação do Cadastro") {
      return true;
    }
    else {
      return false;
    }
  }

  async recuperaContaSelecionada() {
    
    let self = this;
    
    let newSelectedAccount = await this.web3Service.getCurrentAccountSync();

    if ( !self.selectedAccount || (newSelectedAccount !== self.selectedAccount && newSelectedAccount)) {

      this.selectedAccount = newSelectedAccount;
      console.log("selectedAccount=" + this.selectedAccount);

    }
  }






  apagaCamposDaEstrutura() {

    let self = this;
    self.pj.cnpj = "";
    self.pj.razaoSocial = "";
    self.pj.idSubcredito = "";
    self.pj.status = "";
    self.pj.hashDeclaracao = "";
    self.pj.filePathAndName="";
  }


}

