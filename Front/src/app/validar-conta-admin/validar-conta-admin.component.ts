
import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { ChangeDetectorRef } from '@angular/core';
import { DashboardPessoaJuridica } from '../DashboardPessoaJuridica';
import {FileHandleService} from "../file-handle.service";
import { PessoaJuridica } from '../PessoaJuridica';
import { Web3Service } from './../Web3Service';
import { PessoaJuridicaService } from '../pessoa-juridica.service';
import { ListaEventos } from '../shared/ListaEventos';
import { ConstantesService } from '../ConstantesService';
import { Router } from '@angular/router';
import { AlertService } from '../_alert';



import { TableButtonLogic } from './tableButtonLogic';

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
  selector: 'app-validar-conta-admin',
  templateUrl: './validar-conta-admin.component.html',
  styleUrls: ['./validar-conta-admin.component.css']
})
export class ValidarContaAdminComponent implements OnInit {

  //displayedColumns: string[] = ['rbbid', 'cnpj', 'name', 'address' , 'perfil',  'evento', 'status', 'validacao', 'congelamento', 'congelamentoCNPJ'];
  displayedColumns: string[] = [ 'cnpj', 'name', 'address' , 'perfil',  'status', 'validacao', 'declaracao', 'congelamento', 'congelamentoCNPJ','rbbid'];
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

  usuario: any=undefined;
  p: number = 1;
  order: string = 'dataHora';
  reverse: boolean = false;

  contaResponsavelPorValidacao: any =false;
  contaResponsavelPorMonitoramento: any =false;
  selectedAccount: any;

  animationLoad: boolean = true;

  logicButton:TableButtonLogic = new TableButtonLogic()

  alertOptions = {
    autoClose: true,
    keepAfterRouteChange: false
};

  constructor(private pessoaJuridicaService: PessoaJuridicaService,
      private fileHandleService: FileHandleService,private web3Service: Web3Service,
      private ref: ChangeDetectorRef, private router: Router, private zone: NgZone,
      public alertService: AlertService) {

          let self = this;
          self.recuperaContaSelecionada();
          setTimeout(() => {
            setInterval(function () {
              self.recuperaContaSelecionada(),
              1000});
          }, 2030);


  }

  ngOnInit() {
    let users;

    setTimeout(() => {

      if (users == undefined || users.length != Array.from(this.listaTransacoesPJ).length) {
        console.log("ngOnInit :: Inicializa lista de transacoes");
        this.listaTransacoesPJ = [];
      }

      this.monitoraEventos();

    }, 3030)

    setInterval(() => {
      this.estadoLista = this.estadoLista === "undefined" ? "vazia" : "cheia";
      if(this.estadoLista=="cheia"){
        if ( users == undefined || users.length != Array.from(this.listaTransacoesPJ).length ) {
          console.log("ngOnInit :: Atualiza se houve mudança.")
          users = Array.from(this.listaTransacoesPJ);
          this.dataSource = new MatTableDataSource(users);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.dataSource.sortingDataAccessor = (item, property) => {
            switch (property) {
               case 'name': return  item.razaoSocial;
               case 'rbbid': return  item.RBBId;
               case 'address': return  item.contaBlockchain;
               case 'hashDeclaracao': return  item.hashDeclaracao;
               case 'timestamp': return  item.dataHora;
               default: return item[property];
            }
          };
          this.ref.detectChanges();
        }
      }
    }, 1030)

    this.stopAnimationLoad(300000);
    //const users = Array.from({length: 1}, (_, k) => createNewUser(k + 1));


    // Assign the data to the data source for the table to render

  }

  async recuperaContaSelecionada() {

      let self = this;

      let newSelectedAccount = await this.web3Service.getCurrentAccountSync();
      if(newSelectedAccount != undefined){
        if ( !self.selectedAccount || (newSelectedAccount !== self.selectedAccount && newSelectedAccount)) {

          this.selectedAccount = newSelectedAccount;
          console.log("selectedAccount=" + this.selectedAccount);
          try{
          this.usuario = await this.recuperaRegistroBlockchain(this.selectedAccount);
          }
          catch(err){
            console.log("erro ao  recupera registro blockchain");
            this.selectedAccount =undefined;
            return;
          }
          if(this.usuario === undefined){
            this.selectedAccount =undefined;
            return;
          }
          this.contaResponsavelPorValidacao =  await this.web3Service.isResponsibleForRegistryValidation(this.selectedAccount);
          this.contaResponsavelPorMonitoramento = await this.web3Service.isResponsibleForMonitoring(this.selectedAccount);


        }
    }
    }

  async recuperaRegistroBlockchain(enderecoBlockchain) : Promise<any> {
      if (enderecoBlockchain != undefined && enderecoBlockchain != null) {
          let usuario = await this.web3Service.getPJInfo(enderecoBlockchain);
          return usuario;
      } else {
          console.log('this.usuario');
          console.log(this.usuario);
          return undefined
      }

  }

  monitoraEventos() {

      this.blockchainNetworkPrefix = this.web3Service.getInfoBlockchainNetwork().blockchainNetworkPrefix;

//        this.estadoLista = "vazia"

      console.log("*** Executou o metodo de registrar exibicao eventos");
      //ListaEventos.registraEventos(this.web3Service,this);
      //this.web3Service.recuperaNovosEventos(this,ListaEventos.registraNovoEvento);

      ListaEventos.registraEventosCadastro      (this.web3Service, this);
      //ListaEventos.registraEventosTroca         (this.web3Service, this);
      //ListaEventos.registraEventosValidacao     (this.web3Service, this);
      //ListaEventos.registraEventosInvalidacao   (this.web3Service, this);
      //ListaEventos.registraEventosPausa         (this.web3Service, this);
      //ListaEventos.registraEventosDespausa      (this.web3Service, this);
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

    async recuperaDataHora(self, event, transacaoPJ) {
      let timestamp = await this.web3Service.getBlockTimestamp(event.blockNumber);
      transacaoPJ.dataHora = new Date(timestamp * 1000);
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
                if(ConstantesService.production){
                  transacaoPJ.filePathAndName = ConstantesService.serverUrlRoot +"identificacao/"+ result.pathAndName;
                }
                else{
                  transacaoPJ.filePathAndName = ConstantesService.serverUrlRoot + result.pathAndName;
                }
                
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
      let self = this;
      console.log(contaBlockchainValidar);

      if (contaBlockchainValidar === undefined) {
        let s = "A conta blockchain é um Campo Obrigatório";
        console.log("error", "Erro", s, 2);
        return;
      }

      let booleano = await this.web3Service.validarCadastro(contaBlockchainValidar).then(

        function(status) {
         if(status){
          self.alertService.success("Gravação concluída na Blockchain.", self.alertOptions);
          self.router.navigate(['home/associa/contas']);
         }else{
          self.alertService.error("Não foi possível validar cadastro na blockchain. Usuário tem essa permissão?", self.alertOptions);
         }
        }
      , function(error) {
        self.alertService.error("Não foi possível validar cadastro na blockchain. Usuário tem essa permissão?", self.alertOptions);
      });
      /*
      if (booleano) {
        let texto = "O cadastro da conta foi validado.";
            this.alertService.success(texto, this.alertOptions);
            console.log(texto);
            this.router.navigate(['home/validar']);
      }
      else {
        let texto = "Não foi possível validar cadastro na blockchain. Usuário tem essa permissão?";
        this.alertService.error(texto, this.alertOptions);
        return;
      }
      */

      //let texto = "Confirme a operação no metamask e aguarde a confirmação.";
      //this.alertService.info(texto, this.alertOptions);

    }

    async invalidarCadastro(contaBlockchainInvalidar) {

      let self = this;

      if (contaBlockchainInvalidar === undefined) {
        let s = "A conta blockchain é um Campo Obrigatório";
        console.log("error", "Erro", s, 2)
        return;
      }
      let booleano = await this.web3Service.invalidarCadastro(contaBlockchainInvalidar).then(

        function(status) {
          if(status){

          self.alertService.success("Gravação concluída na Blockchain.", self.alertOptions);
          self.router.navigate(['home/associa/contas']);
          }else{
            self.alertService.error("Não foi possível invalidar cadastro na blockchain. Usuário tem essa permissão?", self.alertOptions);
          }
        }
      , function(error) {
        self.alertService.error("Não foi possível invalidar cadastro na blockchain. Usuário tem essa permissão?", self.alertOptions);
      });
/*
      let booleano = <boolean> (await this.web3Service.invalidarCadastro(contaBlockchainInvalidar));

      if (booleano) {
        let texto = "O cadastro da conta foi invalidado.";
            this.alertService.success(texto, this.alertOptions);
            console.log(texto);
            self.router.navigate(['home/validar']);
      }
      else {
        let texto = "Não foi possível invalidar cadastro na blockchain. Usuário tem essa permissão?";
        this.alertService.error(texto, this.alertOptions);
        return;
      }
      */

      //let texto = "Confirme a operação no metamask e aguarde a confirmação.";
      //this.alertService.info(texto, this.alertOptions);

    }

    async pause(contaBlockchain) {
      let self = this;
      console.log(contaBlockchain);

      if (contaBlockchain === undefined) {
        let s = "A conta blockchain é um Campo Obrigatório";
        console.log("error", "Erro", s, 2);
        return;
      }
      let booleano = await this.web3Service.pause(contaBlockchain).then(

        function(status) {
          if(status){

          self.alertService.success("Pause de conta enviada. Aguarde a confirmação.", self.alertOptions);
          self.router.navigate(['home/associa/contas']);
          }
          else{
            let texto = "nao Erro ao pausar cadastro na blockchain possivel";
            this.alertService.info(texto, this.alertOptions);
          }
        }
      , function(error) {
        self.alertService.error("Erro ao pausar cadastro na blockchain", self.alertOptions);
      });
      /*
      let booleano = <boolean> (await this.web3Service.pause(contaBlockchain));

      if (booleano) {
        let texto = "Pause de conta enviada. Aguarde a confirmação.";
        this.alertService.info(texto, this.alertOptions);
        this.router.navigate(['home/validar']);
      }
      else {
        let texto = "Erro ao pausar cadastro na blockchain";
        this.alertService.error(texto, this.alertOptions);
        return;
      }
      */

      //let texto = "Confirme a operação no metamask e aguarde a confirmação.";
      //this.alertService.info(texto, this.alertOptions);

    }

    async unpause(contaBlockchain) {
      let self = this;
      console.log(contaBlockchain);

      if (contaBlockchain === undefined) {
        let texto = "A conta blockchain é um Campo Obrigatório";
        this.alertService.error(texto, this.alertOptions);
        return;
      }

      let booleano = await this.web3Service.unpause(contaBlockchain).then(

        function(status) {
          if(status){
            self.alertService.success("Aguarde a confirmação.", self.alertOptions);
            self.router.navigate(['home/associa/contas']);
          }
          else{
            self.alertService.error("Erro ao despausar cadastro na blockchain", self.alertOptions);
          }

        }
      , function(error) {
        self.alertService.error("Erro ao despausar cadastro na blockchain", self.alertOptions);
      });
      /*
      let booleano = <boolean> (await this.web3Service.unpause(contaBlockchain));

      if (booleano) {
        let texto = "Pause de conta enviada. Aguarde a confirmação.";
        this.alertService.info(texto, this.alertOptions);
        this.router.navigate(['home/validar']);
      }
      else {
        let texto = "Erro ao pausar cadastro na blockchain";
        this.alertService.error(texto, this.alertOptions);
        return;
      }
      */

      //let texto = "Confirme a operação no metamask e aguarde a confirmação.";
      //this.alertService.info(texto, this.alertOptions);


    }

    async pauseCNPJ(rbbid) {
      console.log(rbbid);
      let self = this;
      if (rbbid === undefined) {
        let s = "A rbbid é um Campo Obrigatório";
        console.log("error", "Erro", s, 2);
        return;
      }
      let booleano = await this.web3Service.pauseLegalEntity(rbbid).then(
        function(status) {

          if(status){
            self.alertService.success("Pause de CNPJ enviada. Aguarde a confirmação.", self.alertOptions);
            self.router.navigate(['home/associa/contas']);
          }else{
            self.alertService.error("Erro ao pausar CNPJ na blockchain", self.alertOptions);
            return;
          }

        }
      , function(error) {
        self.alertService.error("Erro ao pausar CNPJ na blockchain", self.alertOptions);
      });
  /*
      let booleano = <boolean> (await this.web3Service.pauseLegalEntity(rbbid));

      if (booleano) {
        let texto = "Pause de conta enviada. Aguarde a confirmação.";
        this.alertService.info(texto, this.alertOptions);
        this.router.navigate(['home/validar']);
      }
      else {
        let texto = "Erro ao pausar cadastro na blockchain";
        this.alertService.error(texto, this.alertOptions);
        return;
      }
      */

      //let texto = "Confirme a operação no metamask e aguarde a confirmação.";
      //this.alertService.info(texto, this.alertOptions);

    }
    stopAnimationLoad(time){
      setTimeout(() => {

        this.animationLoad=false;


      }, time)
    }


}

