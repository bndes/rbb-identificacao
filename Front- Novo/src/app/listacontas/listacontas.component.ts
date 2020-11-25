import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { ChangeDetectorRef } from '@angular/core';
import { DashboardPessoaJuridica } from './DashboardPessoaJuridica';
import {FileHandleService} from "../file-handle.service";
import { PessoaJuridica } from '../PessoaJuridica';
import { Web3Service } from './../Web3Service';
import { PessoaJuridicaService } from '../pessoa-juridica.service';
import { Utils } from '../shared/utils';
import { ConstantesService } from '../ConstantesService';
import { Router } from '@angular/router';

// export interface UserData {
//   id: string;
//   name: string;
//   address: string;
//   timestamp: string;
//   situacao: string;
//   explorer: string;
// }

// export class DashboardPessoaJuridica {
//   razaoSocial: string;
//   cnpj: string;
//   contaBlockchain: string;
//   status: string;
//   hashID: string;
//   uniqueIdentifier: string;
//   hashDeclaracao: string;
//   dataHora: Date;
//   perfil: string;
//   filePathAndName: string;
// }

  
const COLORS: string[] = [
  'maroon', 'red', 'orange', 'yellow', 'olive', 'green', 'purple', 'fuchsia', 'lime', 'teal',
  'aqua', 'blue', 'navy', 'black', 'gray'
];
const NAMES: string[] = [
 '2DU1NFIA3FUBI23UFN2K3FN3WUOIF2UF', 'F31UI23UFN23OVN2OG2UTH23T', 'F123IUFN2IFNUWI3VNGN5UGN45', 
 'FN32OUIFMVOKRMBI5NO5NHU4HN4UOIHN', 'FO23FN234UOFNG3IU5NTTRHBG', 'F2NFNGNTBTYHYHHYHYHYHYYHFG'
];

const SITUACAO: string[] = [
  'VALIDO', 'INVALIDO'
];

const ADDRESS: string[] = [
  'D012DJQ02DJ01FAF31213R2F', '9D23F2F2128HD192RH189F18F', 'D91H298H19T1H9FH9183H918FH1'
];

const TIMESTAMP: string[] = [
  '12:14:14', '12:54:34', '21:14:12'
];



@Component({
  selector: 'app-listacontas',
  templateUrl: './listacontas.component.html',
  styleUrls: ['./listacontas.component.css']
})
export class ListacontasComponent implements OnInit {

  displayedColumns: string[] = ['rbbid', 'cnpj', 'name', 'address' , 'perfil', 'timestamp', 'hashDeclaracao', 'evento', 'status', 'validacao', 'congelamento', 'explorer'];
  dataSource: MatTableDataSource<DashboardPessoaJuridica>;

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


  listaTransacoesPJ: DashboardPessoaJuridica[] = undefined;
  blockchainNetworkPrefix: string;

  estadoLista: string = "undefined";

  usuario: any;

  p: number = 1;
  order: string = 'dataHora';
  reverse: boolean = false;

  selectedAccount: any;

  constructor(private pessoaJuridicaService: PessoaJuridicaService, 
      private fileHandleService: FileHandleService,private web3Service: Web3Service,
      private ref: ChangeDetectorRef, private router: Router, private zone: NgZone) {

          let self = this;
          self.recuperaContaSelecionada();
                      
          setInterval(function () {
            self.recuperaContaSelecionada(), 
            1000}); 

            
  }

  ngOnInit() {
    let users;

      setTimeout(() => {
          this.listaTransacoesPJ = [];
          console.log("Zerou lista de transacoes");

          this.registrarExibicaoEventos();
      }, 1500)

      setTimeout(() => {
          this.estadoLista = this.estadoLista === "undefined" ? "vazia" : "cheia"
          
          users = Array.from(this.listaTransacoesPJ);
          this.dataSource = new MatTableDataSource(users);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;

          this.ref.detectChanges()
      }, 2300)

      
      //const users = Array.from({length: 1}, (_, k) => createNewUser(k + 1));
      

      // Assign the data to the data source for the table to render
     
  }

  async recuperaContaSelecionada() {

      let self = this;
      
      let newSelectedAccount = await this.web3Service.getCurrentAccountSync();
  
      if ( !self.selectedAccount || (newSelectedAccount !== self.selectedAccount && newSelectedAccount)) {
  
        this.selectedAccount = newSelectedAccount;
        console.log("selectedAccount=" + this.selectedAccount);
        this.usuario = this.recuperaRegistroBlockchain(this.selectedAccount);
      }
  
    }    

  async recuperaRegistroBlockchain(enderecoBlockchain) : Promise<any> {
      if (enderecoBlockchain != undefined && enderecoBlockchain != null) {
          let usuario = await this.web3Service.getPJInfoSync(enderecoBlockchain);
          return usuario;
      } else {
          console.log('this.usuario');
          console.log(this.usuario);
      }
      
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
      this.web3Service.registraEventosCadastro(async function (error, event) {

          if (!error) {

              let transacaoPJ: DashboardPessoaJuridica;
              let eventoCadastro = event

              console.log("Evento Cadastro");
              console.log(eventoCadastro);

              transacaoPJ = {
                  RBBId: eventoCadastro.args.RBBId,
                  cnpj : eventoCadastro.args.CNPJ,
                  razaoSocial: "",
                  contaBlockchain: eventoCadastro.args.addr,
                  hashID: eventoCadastro.transactionHash,
                  uniqueIdentifier: eventoCadastro.transactionHash,
                  dataHora: eventoCadastro.dateTimeExpiration,
                  hashDeclaracao: eventoCadastro.args.hashProof,
                  evento: "Realização do Cadastro",
                  status: "",
                  acao: -1,
                  filePathAndName: "",
                  perfil: "",
                  pausada: ""
              }

              
              self.includeIfNotExists(transacaoPJ);
              self.recuperaInfoDerivadaPorCnpj(self, transacaoPJ);
              self.recuperaDataHora(self, event, transacaoPJ);
              self.recuperaFilePathAndName(self,transacaoPJ);

              let registro = await self.recuperaRegistroBlockchain(transacaoPJ.contaBlockchain);
              transacaoPJ.perfil = registro.roleAsString;
              transacaoPJ.status = registro.statusAsString;
              transacaoPJ.acao = registro.status; 
              transacaoPJ.pausada = registro.paused;


          } else {
              console.log("Erro no registro de eventos de cadastro");
              console.log(error);
          }
      });
  }


  registraEventosRoleChange() {

      console.log("*** Executou o metodo de registrar eventos upgrade para Admin");

      let self = this;

      self.web3Service.registraEventosRoleChange(async function (error, event) {

          let transacaoPJ: DashboardPessoaJuridica
          let eventoTroca = event

          console.log("Evento upgrade Admin");
          console.log(eventoTroca);

          if (!error) {

              let transacaoPJContaInativada = {
                  cnpj: eventoTroca.args.CNPJ,
                  razaoSocial: "",
                  contaBlockchain: eventoTroca.args.oldAddr,
                  hashID: eventoTroca.transactionHash,
                  uniqueIdentifier: eventoTroca.transactionHash + "Old",
                  dataHora: null,
                  hashDeclaracao: eventoTroca.args.hashProof,
                  status: "Troca de Papel",
                  filePathAndName: "",                    
                  perfil: "",
                  pausada: ""
              };

              self.includeIfNotExists(transacaoPJContaInativada);
              self.recuperaInfoDerivadaPorCnpj(self, transacaoPJContaInativada);
              self.recuperaDataHora(self, event, transacaoPJContaInativada);
              self.recuperaFilePathAndName(self,transacaoPJContaInativada);

              let registro = await self.recuperaRegistroBlockchain(transacaoPJ.contaBlockchain);
              transacaoPJ.perfil = registro.roleAsString;
              transacaoPJ.status = registro.statusAsString;
              transacaoPJ.acao = registro.status; 
              transacaoPJ.pausada = registro.paused;


              transacaoPJ = {
                  cnpj: eventoTroca.args.CNPJ,
                  RBBId: eventoTroca.args.RBBId,
                  razaoSocial: "",
                  contaBlockchain: eventoTroca.args.newAddr,
                  hashID: eventoTroca.transactionHash,
                  uniqueIdentifier: eventoTroca.transactionHash + "New",                    
                  dataHora: null,
                  hashDeclaracao: eventoTroca.args.hashProof,
                  evento: "Conta Associada por Troca",
                  status: "",
                  acao: -1,
                  filePathAndName: "",                    
                  perfil: "",
                  pausada: ""
              };

              //TODO: nao precisa chamar novamente
              self.includeIfNotExists(transacaoPJ);
              self.recuperaInfoDerivadaPorCnpj(self, transacaoPJ);
              self.recuperaDataHora(self, event, transacaoPJ);
              self.recuperaFilePathAndName(self,transacaoPJ);                

              registro = await self.recuperaRegistroBlockchain(transacaoPJ.contaBlockchain);
              transacaoPJ.perfil = registro.roleAsString;
              transacaoPJ.status = registro.statusAsString;
              transacaoPJ.acao = registro.status; 
              transacaoPJ.pausada = registro.paused;
          }    

      });        
  }

  registraEventosValidacao() {

      console.log("*** Executou o metodo de registrar eventos VALIDACAO");        

      let self = this;        
      this.web3Service.registraEventosValidacao(async function (error, event) {

          if (!error) {

              let transacaoPJ: DashboardPessoaJuridica;

              console.log("Evento validacao");
              console.log(event);

                    
              transacaoPJ = {
                  RBBId :event.args.RBBId,
                  cnpj: event.args.CNPJ,
                  razaoSocial: "",
                  contaBlockchain: event.args.addr,
                  hashID: event.transactionHash,
                  uniqueIdentifier: event.transactionHash,
                  dataHora: null,
                  hashDeclaracao: "",
                  evento: "Validação de Conta",
                  status: "",
                  acao: -1,
                  filePathAndName: "",                    
                  perfil: "",
                  pausada: ""
              }
              self.includeIfNotExists(transacaoPJ);
              self.recuperaInfoDerivadaPorCnpj(self, transacaoPJ);
              self.recuperaDataHora(self, event, transacaoPJ);
//nao tem hash para recuperar arquivo
//                self.recuperaFilePathAndName(self,transacaoPJ);                
              
              let registro = await self.recuperaRegistroBlockchain(transacaoPJ.contaBlockchain);
              transacaoPJ.perfil = registro.roleAsString;
              transacaoPJ.status = registro.statusAsString;
              transacaoPJ.acao = registro.status; 
              transacaoPJ.pausada = registro.paused;

          } else {
              console.log("Erro no registro de eventos de validacao");
              console.log(error);
          }
      });
      
  }


  registraEventosInvalidacao() {

      console.log("*** Executou o metodo de registrar eventos INVALIDACAO");                

      let self = this;        
      this.web3Service.registraEventosInvalidacao(async function (error, event) {

          if (!error) {

              let transacaoPJ: DashboardPessoaJuridica;

              console.log("Evento invalidacao");
              console.log(event);
                    
              transacaoPJ = {
                  RBBId :event.args.RBBId,
                  cnpj: event.args.CNPJ,
                  razaoSocial: "",
                  contaBlockchain: event.args.addr,
                  hashID: event.transactionHash,
                  uniqueIdentifier: event.transactionHash,                    
                  dataHora: null,
                  hashDeclaracao: "",
                  evento: "Invalidação de Conta",
                  status: "",
                  acao: -1,
                  filePathAndName: "",                    
                  perfil: "",
                  pausada: ""
              }
              self.includeIfNotExists(transacaoPJ);
              self.recuperaInfoDerivadaPorCnpj(self, transacaoPJ);                
              self.recuperaDataHora(self, event, transacaoPJ);
//nao tem hash para recuperar arquivo
//                self.recuperaFilePathAndName(self,transacaoPJ);                

              let registro = await self.recuperaRegistroBlockchain(transacaoPJ.contaBlockchain);
              transacaoPJ.perfil = registro.roleAsString;
              transacaoPJ.status = registro.statusAsString;
              transacaoPJ.acao = registro.status; 
              transacaoPJ.pausada = registro.paused;


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

  async recuperaInfoDerivadaPorCnpj(self, transacaoPJ) {
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
              transacaoPJ.filePathAndName=ConstantesService.serverUrl+result.pathAndName;
            }
            else {
              let texto = "Não foi possível encontrar informações associadas ao arquivo desse cadastro.";
              console.log(texto);
              //Utils.criarAlertaAcaoUsuario( self.bnAlertsService, texto);       
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
        console.log("error", "Erro", s, 2);
        return;
      }    
  // let x = await this.recuperaRegistroBlockchain(this.selectedAccount);
  // console.log("this.usuario.address = "+ this.usuario.address)
      let bRV = await this.web3Service.isResponsibleForRegistryValidationSync(this.selectedAccount);
      if (!bRV) 
      {
          let s = "Conta selecionada no Metamask não pode executar uma validação.";
          console.log("error", "Erro", s, 5);
          return;
      }
    
  
      let self = this;
  
      let booleano = this.web3Service.validarCadastro(contaBlockchainValidar, 
  
        
           (txHash) => {
             /*
            Utils.criarAlertasAvisoConfirmacao( txHash, 
                                                self.web3Service, 
                                                self.bnAlertsService, 
                                                "Validação de conta enviada. Aguarde a confirmação.", 
                                                "O cadastro da conta foi validado e confirmado na blockchain.", 
                                                self.zone)
                                                */
            self.router.navigate(['home/associa/contas']);
            }        
          ,(error) => {
            /*
            Utils.criarAlertaErro( self.bnAlertsService, 
                                   "Erro ao validar cadastro na blockchain", 
                                   error )  
                                   */
          }
        );
       // Utils.criarAlertaAcaoUsuario( self.bnAlertsService, 
         //                             "Confirme a operação no metamask e aguarde a confirmação." )         
    }
  
    async invalidarCadastro(contaBlockchainInvalidar) {
  
      let self = this;
  
      if (contaBlockchainInvalidar === undefined) {
        let s = "A conta blockchain é um Campo Obrigatório";
        console.log("error", "Erro", s, 2)
        return;
      }
  
      let bRV = await this.web3Service.isResponsibleForRegistryValidationSync(this.selectedAccount);
      if (!bRV) 
      {
          let s = "Conta selecionada no Metamask não pode executar a ação de invalidar.";
          console.log("error", "Erro", s, 5);
          return;
      }
  
      let booleano = this.web3Service.invalidarCadastro(contaBlockchainInvalidar, 
        (result) => {
            let s = "O cadastro da conta foi invalidado.";
          //  self.bnAlertsService.criarAlerta("info", "Sucesso", s, 5);
            console.log(s);
  
            self.router.navigate(['home/associa/contas']);
      },
      (error) => {
        console.log("Erro ao invalidar cadastro")
      });
    }


    
    async pause(contaBlockchain) {
      console.log(contaBlockchain);
      
      if (contaBlockchain === undefined) {
        let s = "A conta blockchain é um Campo Obrigatório";
        console.log("error", "Erro", s, 2);
        return;
      }    
  
      let self = this;
  
      let booleano = this.web3Service.pause(contaBlockchain, 
          
           (txHash) => {
             /*
            Utils.criarAlertasAvisoConfirmacao( txHash, 
                                                self.web3Service, 
                                                self.bnAlertsService, 
                                                "Validação de conta enviada. Aguarde a confirmação.", 
                                                "O cadastro da conta foi validado e confirmado na blockchain.", 
                                                self.zone)
                                                */
            self.router.navigate(['home/associa/contas']);
            }        
          ,(error) => {
            /*
            Utils.criarAlertaErro( self.bnAlertsService, 
                                   "Erro ao validar cadastro na blockchain", 
                                   error )  
                                   */
          }
        );
       // Utils.criarAlertaAcaoUsuario( self.bnAlertsService, 
         //                             "Confirme a operação no metamask e aguarde a confirmação." )         
    }

    async unpause(contaBlockchain) {
      console.log(contaBlockchain);
      
      if (contaBlockchain === undefined) {
        let s = "A conta blockchain é um Campo Obrigatório";
        console.log("error", "Erro", s, 2);
        return;
      }    
  
      let self = this;
  
      let booleano = this.web3Service.unpause(contaBlockchain, 
          
           (txHash) => {
             /*
            Utils.criarAlertasAvisoConfirmacao( txHash, 
                                                self.web3Service, 
                                                self.bnAlertsService, 
                                                "Validação de conta enviada. Aguarde a confirmação.", 
                                                "O cadastro da conta foi validado e confirmado na blockchain.", 
                                                self.zone)
                                                */
            self.router.navigate(['home/associa/contas']);
            }        
          ,(error) => {
            /*
            Utils.criarAlertaErro( self.bnAlertsService, 
                                   "Erro ao validar cadastro na blockchain", 
                                   error )  
                                   */
          }
        );
       // Utils.criarAlertaAcaoUsuario( self.bnAlertsService, 
         //                             "Confirme a operação no metamask e aguarde a confirmação." )         
    }


    async pauseCNPJ(rbbid) {
      console.log(rbbid);
      
      if (rbbid === undefined) {
        let s = "A rbbid é um Campo Obrigatório";
        console.log("error", "Erro", s, 2);
        return;
      }    
  
      let self = this;
  
      let booleano = this.web3Service.pauseLegalEntity(rbbid, 
          
           (txHash) => {
             /*
            Utils.criarAlertasAvisoConfirmacao( txHash, 
                                                self.web3Service, 
                                                self.bnAlertsService, 
                                                "Validação de conta enviada. Aguarde a confirmação.", 
                                                "O cadastro da conta foi validado e confirmado na blockchain.", 
                                                self.zone)
                                                */
            self.router.navigate(['home/associa/contas']);
            }        
          ,(error) => {
            /*
            Utils.criarAlertaErro( self.bnAlertsService, 
                                   "Erro ao validar cadastro na blockchain", 
                                   error )  
                                   */
          }
        );
       // Utils.criarAlertaAcaoUsuario( self.bnAlertsService, 
         //                             "Confirme a operação no metamask e aguarde a confirmação." )         
    }


}

// function createNewUser(id: number): UserData {
  
//   return {
//     id: id.toString(),
//     name: NAMES[Math.round(Math.random() * (NAMES.length - 1))],
//     address: ADDRESS[Math.round(Math.random() * (ADDRESS.length - 1))],
//     timestamp: TIMESTAMP[Math.round(Math.random() * (ADDRESS.length - 1))],
//     situacao: SITUACAO[Math.round(Math.random() * (SITUACAO.length - 1))],
//     explorer: COLORS[Math.round(Math.random() * (COLORS.length - 1))]
//   };
  
// }



