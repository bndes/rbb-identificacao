import { Component, OnInit, NgZone } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { DashboardPessoaJuridica } from './DashboardPessoaJuridica';
import {FileHandleService} from "../file-handle.service";
import { PessoaJuridica } from '../PessoaJuridica';
import { Web3Service } from './../Web3Service';
import { PessoaJuridicaService } from '../pessoa-juridica.service';
import { Utils } from '../shared/utils';
import { ConstantesService } from '../ConstantesService';
import { Router } from '@angular/router';


import { BnAlertsService } from 'bndes-ux4';

@Component({
    selector: 'app-dashboard-id-empresa',
    templateUrl: './dashboard-id-empresa.component.html',
    styleUrls: ['./dashboard-id-empresa.component.css']
})



export class DashboardIdEmpresaComponent implements OnInit {

    listaTransacoesPJ: DashboardPessoaJuridica[] = undefined;
    blockchainNetworkPrefix: string;

    estadoLista: string = "undefined";

    usuario: any;

    p: number = 1;
    order: string = 'dataHora';
    reverse: boolean = false;

    selectedAccount: any;

    constructor(private pessoaJuridicaService: PessoaJuridicaService, 
        private fileHandleService: FileHandleService,
        protected bnAlertsService: BnAlertsService, private web3Service: Web3Service,
        private ref: ChangeDetectorRef, private router: Router, private zone: NgZone) {

            let self = this;
            self.recuperaContaSelecionada();
                        
            setInterval(function () {
              self.recuperaContaSelecionada(), 
              1000}); 
              
    }

    ngOnInit() {
        setTimeout(() => {
            this.listaTransacoesPJ = [];
            console.log("Zerou lista de transacoes");

            this.registrarExibicaoEventos();
        }, 1500)

        setTimeout(() => {
            this.estadoLista = this.estadoLista === "undefined" ? "vazia" : "cheia"
            this.ref.detectChanges()
        }, 2300)
    }

    async recuperaContaSelecionada() {

        let self = this;
        
        let newSelectedAccount = await this.web3Service.getCurrentAccountSync();
    
        if ( !self.selectedAccount || (newSelectedAccount !== self.selectedAccount && newSelectedAccount)) {
    
          this.selectedAccount = newSelectedAccount;
          console.log("selectedAccount=" + this.selectedAccount);
          this.identificaUsuario();
        }
    
      }    

    async identificaUsuario() {
        this.usuario = await this.web3Service.getPJInfoSync(this.selectedAccount);
        console.log(this.usuario);
    }

    registrarExibicaoEventos() {

        this.blockchainNetworkPrefix = this.web3Service.getInfoBlockchainNetwork().blockchainNetworkPrefix;

//        this.estadoLista = "vazia"

        console.log("*** Executou o metodo de registrar exibicao eventos");

        this.registraEventosCadastro();
        this.registraEventosValidacao();
        this.registraEventosInvalidacao();

        this.registraEventosRoleChange(); 
        //TODO: this.registraEventosPausa();
        //TODO: this.registraEventosDespausa();
    }


    registraEventosCadastro() {

        console.log("*** Executou o metodo de registrar eventos CADASTRO");

        let self = this;        
        this.web3Service.registraEventosCadastro(function (error, event) {

            if (!error) {

                let transacaoPJ: DashboardPessoaJuridica;
                let eventoCadastro = event

                console.log("Evento Cadastro");
                console.log(eventoCadastro);

                transacaoPJ = {
                    cnpj: eventoCadastro.args.id,
                    razaoSocial: "",
                    contaBlockchain: eventoCadastro.args.addr,
                    hashID: eventoCadastro.transactionHash,
                    uniqueIdentifier: eventoCadastro.transactionHash,
                    dataHora: null,
                    hashDeclaracao: eventoCadastro.args.idProofHash,
                    status: "Conta Cadastrada",
                    filePathAndName: "",
                    perfil: ""
                }

                
                self.includeIfNotExists(transacaoPJ);
                self.recuperaInfoDerivadaPorCnpj(self, transacaoPJ);
                self.recuperaDataHora(self, event, transacaoPJ);
                self.recuperaFilePathAndName(self,transacaoPJ); 


            } else {
                console.log("Erro no registro de eventos de cadastro");
                console.log(error);
            }
        });
    }


    registraEventosRoleChange() {

        console.log("*** Executou o metodo de registrar eventos upgrade para Admin");

        let self = this;

        self.web3Service.registraEventosRoleChange(function (error, event) {

            let transacaoPJ: DashboardPessoaJuridica
            let eventoTroca = event

            console.log("Evento upgrade Admin");
            console.log(eventoTroca);

            if (!error) {

                let transacaoPJContaInativada = {
                    cnpj: eventoTroca.args.cnpj,
                    razaoSocial: "",
                    contaBlockchain: eventoTroca.args.oldAddr,
                    hashID: eventoTroca.transactionHash,
                    uniqueIdentifier: eventoTroca.transactionHash + "Old",
                    dataHora: null,
                    hashDeclaracao: eventoTroca.args.idProofHash,
                    status: "Conta Inativada por Troca",
                    filePathAndName: "",                    
                    perfil: ""
                };

                self.includeIfNotExists(transacaoPJContaInativada);
                self.recuperaInfoDerivadaPorCnpj(self, transacaoPJContaInativada);
                self.recuperaDataHora(self, event, transacaoPJContaInativada);
                self.recuperaFilePathAndName(self,transacaoPJContaInativada);


                transacaoPJ = {
                    cnpj: eventoTroca.args.cnpj,
                    razaoSocial: "",
                    contaBlockchain: eventoTroca.args.newAddr,
                    hashID: eventoTroca.transactionHash,
                    uniqueIdentifier: eventoTroca.transactionHash + "New",                    
                    dataHora: null,
                    hashDeclaracao: eventoTroca.args.idProofHash,
                    status: "Conta Associada por Troca",
                    filePathAndName: "",                    
                    perfil: ""
                };

                //TODO: nao precisa chamar novamente
                self.includeIfNotExists(transacaoPJ);
                self.recuperaInfoDerivadaPorCnpj(self, transacaoPJ);
                self.recuperaDataHora(self, event, transacaoPJ);
                self.recuperaFilePathAndName(self,transacaoPJ);                
            }    

        });        
    }

    registraEventosValidacao() {

        console.log("*** Executou o metodo de registrar eventos VALIDACAO");        

        let self = this;        
        this.web3Service.registraEventosValidacao(function (error, event) {

            if (!error) {

                let transacaoPJ: DashboardPessoaJuridica;

                console.log("Evento validacao");
                console.log(event);

                      
                transacaoPJ = {
                    cnpj: event.args.cnpj,
                    razaoSocial: "",
                    contaBlockchain: event.args.addr,
                    hashID: event.transactionHash,
                    uniqueIdentifier: event.transactionHash,
                    dataHora: null,
                    hashDeclaracao: "",
                    status: "Conta Validada",
                    filePathAndName: "",                    
                    perfil: ""
                }
                self.includeIfNotExists(transacaoPJ);
                self.recuperaInfoDerivadaPorCnpj(self, transacaoPJ);
                self.recuperaDataHora(self, event, transacaoPJ);
//nao tem hash para recuperar arquivo
//                self.recuperaFilePathAndName(self,transacaoPJ);                

            } else {
                console.log("Erro no registro de eventos de validacao");
                console.log(error);
            }
        });
        
    }


    registraEventosInvalidacao() {

        console.log("*** Executou o metodo de registrar eventos INVALIDACAO");                

        let self = this;        
        this.web3Service.registraEventosInvalidacao(function (error, event) {

            if (!error) {

                let transacaoPJ: DashboardPessoaJuridica;

                console.log("Evento invalidacao");
                console.log(event);
                      
                transacaoPJ = {
                    cnpj: event.args.cnpj,
                    razaoSocial: "",
                    contaBlockchain: event.args.addr,
                    hashID: event.transactionHash,
                    uniqueIdentifier: event.transactionHash,                    
                    dataHora: null,
                    hashDeclaracao: "",
                    status: "Conta Invalidada por Validador",
                    filePathAndName: "",                    
                    perfil: ""
                }
                self.includeIfNotExists(transacaoPJ);
                self.recuperaInfoDerivadaPorCnpj(self, transacaoPJ);                
                self.recuperaDataHora(self, event, transacaoPJ);
//nao tem hash para recuperar arquivo
//                self.recuperaFilePathAndName(self,transacaoPJ);                


            } else {
                console.log("Erro no registro de eventos de invalidacao");
                console.log(error);
            }
        });
        
    }

    includeIfNotExists(transacaoPJ) {
        let result = this.listaTransacoesPJ.find(tr => tr.uniqueIdentifier == transacaoPJ.uniqueIdentifier);
        if (!result) this.listaTransacoesPJ.push(transacaoPJ);        
    }


    setOrder(value: string) {
        if (this.order === value) {
            this.reverse = !this.reverse;
        }
        this.order = value;
        this.ref.detectChanges();
    }

    customComparator(itemA, itemB) {
        return itemB - itemA;
    }

    recuperaInfoDerivadaPorCnpj(self, transacaoPJ) {
        self.pessoaJuridicaService.recuperaEmpresaPorCnpj(transacaoPJ.cnpj).subscribe(
            data => {
                transacaoPJ.razaoSocial = "Erro: Não encontrado";
                if (data && data.dadosCadastrais) {
                    transacaoPJ.razaoSocial = data.dadosCadastrais.razaoSocial;
                  }
                  
                // Colocar dentro da zona do Angular para ter a atualização de forma correta
                self.zone.run(() => {
                    self.estadoLista = "cheia"
                    console.log("inseriu transacao Troca");
                });

            },
            error => {
                console.log("Erro ao buscar dados da empresa");
                transacaoPJ.razaoSocial = "";
                transacaoPJ.contaBlockchain = "";
            });

            
            transacaoPJ.perfil="DEFINIRAQUI";            
    
            


    }

    recuperaDataHora(self, event, transacaoPJ) {
        self.web3Service.getBlockTimestamp(event.blockHash,
            function (error, result) {
                if (!error) {
                    transacaoPJ.dataHora = new Date(result.timestamp * 1000);
                    self.ref.detectChanges();
                }
                else {
                    console.log("Erro ao recuperar data e hora do bloco");
                    console.error(error);
                }
        });

    }

    recuperaFilePathAndName(self,transacaoPJ) {

        if ( transacaoPJ == undefined || 
            (transacaoPJ.cnpj == undefined || transacaoPJ.cnpj == "" ) || ( transacaoPJ.hashDeclaracao == undefined || transacaoPJ.hashDeclaracao == "") || 
             (transacaoPJ.contaBlockchain == undefined || transacaoPJ.contaBlockchain == "" ) 
           ) {
            console.log("Transacao incompleta no recuperaFilePathAndName do dashboard-empresa");
            return;
        }

        let antigoNumeroContrato = 0;

        self.fileHandleService.buscaFileInfo(transacaoPJ.cnpj, antigoNumeroContrato, 
            transacaoPJ.contaBlockchain, transacaoPJ.hashDeclaracao, "declaracao").subscribe(
            result => {
              if (result && result.pathAndName) {
                transacaoPJ.filePathAndName=ConstantesService.serverUrlRoot+result.pathAndName;
              }
              else {
                let texto = "Não foi possível encontrar informações associadas ao arquivo desse cadastro.";
                console.log(texto);
                Utils.criarAlertaAcaoUsuario( self.bnAlertsService, texto);       
              }                  
            }, 
            error => {
              let texto = "Erro ao buscar dados de arquivo";
              console.log(texto);
              console.log("cnpj=" + transacaoPJ.cnpj);
              console.log("contaBlockchain=" + transacaoPJ.contaBlockchain);
//              Utils.criarAlertaErro( self.bnAlertsService, texto,error);
            }) //fecha busca fileInfo


    }

    async validarCadastro(contaBlockchainValidar) {
        console.log(contaBlockchainValidar);
        
        if (contaBlockchainValidar === undefined) {
          let s = "A conta blockchain é um Campo Obrigatório";
          this.bnAlertsService.criarAlerta("error", "Erro", s, 2);
          return;
        }    
    let x = await this.identificaUsuario();
    console.log("this.usuario.address = "+ this.usuario.address)
        let bRV = await this.web3Service.isResponsibleForRegistryValidationSync(this.usuario.address);
        if (!bRV) 
        {
            let s = "Conta selecionada no Metamask não pode executar uma validação.";
            this.bnAlertsService.criarAlerta("error", "Erro", s, 5);
            return;
        }
      
    
        let self = this;
    
        let booleano = this.web3Service.validarCadastro(contaBlockchainValidar, 
    
          
             (txHash) => {
              Utils.criarAlertasAvisoConfirmacao( txHash, 
                                                  self.web3Service, 
                                                  self.bnAlertsService, 
                                                  "Validação de conta enviada. Aguarde a confirmação.", 
                                                  "O cadastro da conta foi validado e confirmado na blockchain.", 
                                                  self.zone)
              self.router.navigate(['registro/dash-empresas']);                                                     
              }        
            ,(error) => {
              Utils.criarAlertaErro( self.bnAlertsService, 
                                     "Erro ao validar cadastro na blockchain", 
                                     error )  
            }
          );
          Utils.criarAlertaAcaoUsuario( self.bnAlertsService, 
                                        "Confirme a operação no metamask e aguarde a confirmação." )         
      }
    
      async invalidarCadastro(contaBlockchainInvalidar) {
    
        let self = this;
    
        if (contaBlockchainInvalidar === undefined) {
          let s = "A conta blockchain é um Campo Obrigatório";
          this.bnAlertsService.criarAlerta("error", "Erro", s, 2)
          return;
        }
    
        let bRV = await this.web3Service.isResponsibleForRegistryValidationSync(this.usuario.address);
        if (!bRV) 
        {
            let s = "Conta selecionada no Metamask não pode executar a ação de invalidar.";
            this.bnAlertsService.criarAlerta("error", "Erro", s, 5);
            return;
        }
    
        let booleano = this.web3Service.invalidarCadastro(contaBlockchainInvalidar, 
          (result) => {
              let s = "O cadastro da conta foi invalidado.";
              self.bnAlertsService.criarAlerta("info", "Sucesso", s, 5);
              console.log(s);
    
              self.router.navigate(['registro/dash-empresas'])
        },
        (error) => {
          console.log("Erro ao invalidar cadastro")
        });
      }

      

}
