import { Injectable  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConstantesService } from './ConstantesService';
import { formattedError } from '@angular/compiler';

@Injectable()
export class Web3Service {

    private serverUrl: string;

    private RBBRegistryAddress: string = '';
    private blockchainNetwork: string = '';
    private ethereum: any;
    private web3Instance: any;                  // Current instance of web3

    private RBBRegistrySmartContract: any;

    // Application Binary Interface so we can use the question contract
    private ABIRBBRegistry;

    private vetorTxJaProcessadas : any[];

    private eventoBNDESRegistry: any;
    private eventoCadastro: any;
    private eventoTransacao: any;
    private eventoDoacao: any;

    private addressOwner: string;

    private decimais : number;

    constructor(private http: HttpClient, private constantes: ConstantesService) {
       
        this.vetorTxJaProcessadas = [];

        this.serverUrl = ConstantesService.serverUrl;
        console.log("Web3Service.ts :: Selecionou URL = " + this.serverUrl)

        this.http.post<Object>(this.serverUrl + 'constantesFront', {}).subscribe(
            data => {

                this.RBBRegistryAddress = data["addrContratoBNDESRegistry"];
                this.blockchainNetwork = data["blockchainNetwork"];
                this.ABIRBBRegistry = data['abiBNDESRegistry'];

                console.log("abis");
                console.log(this.ABIRBBRegistry);

                this.intializeWeb3();

            },
            error => {
                console.log("**** Erro ao buscar constantes do front");
            });
            
    }


    public getInfoBlockchainNetwork(): any {

        let blockchainNetworkAsString = "Localhost";
        let blockchainNetworkPrefix = "";
        if (this.blockchainNetwork=="4") {
            blockchainNetworkAsString = "Rinkeby";
            blockchainNetworkPrefix = "rinkeby."
        }
        else if (this.blockchainNetwork=="1") {
            blockchainNetworkAsString = "Mainnet";
        }

        return {
            blockchainNetwork:this.blockchainNetwork,
            blockchainNetworkAsString:blockchainNetworkAsString,
            blockchainNetworkPrefix: blockchainNetworkPrefix,
            registryAddr: this.RBBRegistryAddress
        };
    }


    //fonte: https://www.xul.fr/javascript/callback-to-promise.php
    public getCurrentAccountSync() {
        let self = this;
        return new Promise(function(resolve, reject) {
            self.web3.eth.getAccounts(function(error, accounts) {
                resolve(accounts[0]);
            })
        })
    }


    private intializeWeb3(): void {

        if (typeof window['web3'] !== 'undefined') {
            this.ethereum =  window['ethereum'];
            console.log("ethereum=");
            console.log(this.ethereum);
            this.web3 = new this.Web3(window['web3'].currentProvider);
            console.log("Conectado com noh");
    
        } else {
            console.log('Using HTTP node --- nao suportado');
            return; 
        }

        //this.bndesTokenSmartContract = this.web3.eth.contract(this.ABIBndesToken).at(this.addrContratoBNDESToken);
        this.RBBRegistrySmartContract = this.web3.eth.contract(this.ABIRBBRegistry).at(this.RBBRegistryAddress);

        console.log("INICIALIZOU O WEB3 - bndesTokenContract abaixo");
        console.log("BNDESToken=");
        //console.log(this.bndesTokenSmartContract);        
        console.log("BNDESRegistry=");
        console.log(this.RBBRegistrySmartContract);

        let self = this;

        this.getAddressOwner(function (addrOwner) {
            console.log("Owner Addr =" + addrOwner);
            self.addressOwner = addrOwner;
        }, function (error) {
            console.log("Erro ao buscar owner=" + error);
        });

}

    conectar () {
        this.ethereum.enable();
    }

    get web3(): any {
        if (!this.web3Instance) {
            this.intializeWeb3();
        }
        return this.web3Instance;
    }
    set web3(web3: any) {
        this.web3Instance = web3;
    }
/*    get currentAddr(): string {
        return this.contractAddr;
    }
    set currentAddr(contractAddr: string) {
        if (contractAddr.length === 42 || contractAddr.length === 40) {
            this.contractAddr = contractAddr;
        } else {
            console.log('Invalid address used');
        }
    }
*/    
    get Web3(): any {
        return window['Web3'];
    }

    registraEventosCadastro(callback) {
        this.eventoCadastro = this.RBBRegistrySmartContract.AccountRegistration({}, { fromBlock: 0, toBlock: 'latest' });
        this.eventoCadastro.watch(callback);
    }
    registraEventosValidacao(callback) {
        this.eventoCadastro = this.RBBRegistrySmartContract.AccountValidation({}, { fromBlock: 0, toBlock: 'latest' });
        this.eventoCadastro.watch(callback);
    }
    registraEventosInvalidacao(callback) {
        this.eventoCadastro = this.RBBRegistrySmartContract.AccountInvalidation({}, { fromBlock: 0, toBlock: 'latest' });
        this.eventoCadastro.watch(callback);
    }    
    registraEventosRoleChange(callback) {
        this.eventoCadastro = this.RBBRegistrySmartContract.AccountRoleChange({}, { fromBlock: 0, toBlock: 'latest' });
        this.eventoCadastro.watch(callback);
    }
    registraEventosPausa(callback) {        
        this.eventoCadastro = this.RBBRegistrySmartContract.AccountPaused({}, { fromBlock: 0, toBlock: 'latest' });
        this.eventoTransacao.watch(callback);
    }
    registraEventosDespausa(callback) {
        this.eventoCadastro = this.RBBRegistrySmartContract.AccountUnpaused({}, { fromBlock: 0, toBlock: 'latest' });
        this.eventoTransacao.watch(callback);
    }
    
    registraWatcherEventosLocal(txHashProcurado, callback) {
        let self = this;
        console.info("Callback ", callback);
        const filtro = { fromBlock: 'latest', toBlock: 'pending' }; 

        this.eventoBNDESRegistry = this.RBBRegistrySmartContract.allEvents( filtro );                 
        this.eventoBNDESRegistry.watch( function (error, result) {
            console.log("Watcher BNDESRegistry executando...")
            self.procuraTransacao(error, result, txHashProcurado, self, callback);
        });
     
        console.log("registrou o watcher de eventos");
    }

    procuraTransacao(error, result, txHashProcurado, self, callback) {
        console.log( "Entrou no procuraTransacao" );
        console.log( "txHashProcurado: " + txHashProcurado );
        console.log( "result.transactionHash: " + result.transactionHash );
        self.web3.eth.getTransactionReceipt(txHashProcurado,  function (error, result) {
            if ( !error ) {
                let status = result.status
                let STATUS_MINED = 0x1
                console.log("Achou o recibo da transacao... " + status)     
                if ( status == STATUS_MINED && !self.vetorTxJaProcessadas.includes(txHashProcurado)) {
                    self.vetorTxJaProcessadas.push(txHashProcurado);
                    callback(error, result);        
                } else {
                    console.log('"Status da tx pendente ou jah processado"')
                }
            }
            else {
              console.log('Nao eh o evento de confirmacao procurado')
            } 
        });     
    }


    async cadastra(cnpj: number, hashdeclaracao: string,
        fSuccess: any, fError: any) {

        let contaBlockchain = await this.getCurrentAccountSync();    
        
        console.log("Web3Service - Cadastra")
        console.log("CNPJ: " + cnpj +  
            ", hashdeclaracao: " + hashdeclaracao 
            )

        this.RBBRegistrySmartContract.registryLegalEntity(cnpj, 
            hashdeclaracao,
            { from: contaBlockchain, gas: 500000 },
            (error, result) => {
                if (error) fError(error);
                else fSuccess(result);
            });
    }

    async pause(contaBlockchain: string, fSuccess: any, fError: any) {
        let responsavel = await this.getCurrentAccountSync();    
        
        console.log("Web3Service - Pause");
        console.log("Conta Blockchain: " + contaBlockchain );

        this.RBBRegistrySmartContract.pauseAddress(contaBlockchain,
            { from: responsavel, gas: 500000 },
            (error, result) => {
                if (error) fError(error);
                else fSuccess(result);
            });
    }

    async unpause(contaBlockchain: string, fSuccess: any, fError: any) {
        let responsavel = await this.getCurrentAccountSync();    
        
        console.log("Web3Service - Unpause");
        console.log("Conta Blockchain: " + contaBlockchain );

        this.RBBRegistrySmartContract.unpauseAddress(contaBlockchain,
            { from: responsavel, gas: 500000 },
            (error, result) => {
                if (error) fError(error);
                else fSuccess(result);
            });
    }

    async pauseLegalEntity(rbbid: number, fSuccess: any, fError: any) {
        let responsavel = await this.getCurrentAccountSync();    
        
        console.log("Web3Service - pauseLegalEntity");
        console.log("RBBId: " + rbbid );

        this.RBBRegistrySmartContract.pauseLegalEntity(rbbid,
            { from: responsavel, gas: 500000 },
            (error, result) => {
                if (error) fError(error);
                else fSuccess(result);
            });
    }

    getId(addr: string, fSuccess: any, fError: any): number {
        return this.RBBRegistrySmartContract.getId(addr,
            (error, result) => {
                if (error) fError(error);
                else fSuccess(result);
            });
    }

    getPJInfo(addr: string, fSuccess: any, fError: any): number {
        let self = this;
        // console.log("getPJInfo com addr=" + addr);
        // console.log("RBBRegistrySmartContract=");
        // console.log(this.RBBRegistrySmartContract);
        return this.RBBRegistrySmartContract.getRegistry(addr,
            (error, result) => {
                if (error) fError(error);
                else {
                    let pjInfo = self.montaPJInfo(result);
                    pjInfo.address = addr; //apendice com endereco
                    fSuccess(pjInfo);
                }
            });
    }

    getPJInfoSync(address: string) {
        let self = this;

        return new Promise (function(resolve) {
            self.getPJInfo(address, function(result) {
                resolve(result);
            }, function(reject) {
                console.log("ERRO getPJInfo  SYNC");
                reject(false);
            });
        })
    }    

    getAddressOwner(fSuccess: any, fError: any): number {
        return this.RBBRegistrySmartContract.owner(
            (error, result) => {
                if (error) fError(error);
                else fSuccess(result);
            });
    }

    getBlockTimestamp(blockHash: number, fResult: any) {

        this.web3.eth.getBlock(blockHash, fResult);

    }      

    isResponsibleForRegistryValidation(address: string, fSuccess: any, fError: any): boolean {

        return this.RBBRegistrySmartContract.isSortOfAdmin(address,
            (error, result) => {
                if (error) fError(error);
                else fSuccess(result);
            });
    }

    isResponsibleForRegistryValidationSync(address: string) {
        let self = this;

        return new Promise (function(resolve) {
            self.isResponsibleForRegistryValidation(address, function(result) {
                resolve(result);
            }, function(reject) {
                console.log("ERRO isResponsibleForRegistryValidation  SYNC");
                reject(false);
            });
        })
    }    

    accountIsActive(address: string, fSuccess: any, fError: any): boolean {
        return this.RBBRegistrySmartContract.isValidatedAccount(address, 
        (error, result) => {
            if(error) fError(error);
            else fSuccess(result);
        });
    }

    isContaDisponivel(address: string, fSuccess: any, fError: any): boolean {
 
        return this.RBBRegistrySmartContract.isAvailableAccount(address, 
            (error, result) => {
                if(error) fError(error);
                else fSuccess(result);
            });
    }

    public isContaDisponivelSync(address: string) {
        
        let self = this;

        return new Promise (function(resolve) {
            self.isContaDisponivel(address, function(result) {
                resolve(result);
            }, function(reject) {
                console.log("ERRO IS CONTA DISPONIVEL SYNC");
                reject(false);
            });
        })
    }


    isContaAguardandoValidacao(address: string, fSuccess: any, fError: any): boolean {
        return this.RBBRegistrySmartContract.isWaitingValidationAccount(address, 
            (error, result) => {
                if(error) fError(error);
                else fSuccess(result);
            });
    }

    public isContaAguardandoValidacaoSync(address: string) {
        
        let self = this;

        return new Promise (function(resolve) {
            self.isContaAguardandoValidacao(address, function(result) {
                resolve(result);
            }, function(reject) {
                console.log("ERRO IS CONTA AGUARDANDO VALIDACAO SYNC");
                reject(false);
            });
        })
    }

    isContaValidada(address: string, fSuccess: any, fError: any): boolean {
        return this.RBBRegistrySmartContract.isValidatedAccount(address, 
            (error, result) => {
                if(error) fError(error);
                else fSuccess(result);
            });
    }

    public isContaValidadaSync(address: string) {
        
        let self = this;

        return new Promise (function(resolve) {
            self.isContaValidada(address, function(result) {
                resolve(result);
            }, function(reject) {
                console.log("ERRO IS CONTA VALIDADA SYNC");
                reject(false);
            });
        })
    }

    async validarCadastro(address: string, fSuccess: any, fError: any) {
        
        let contaBlockchain = await this.getCurrentAccountSync();    

        this.RBBRegistrySmartContract.validateRegistrySameOrg(address, 
            { from: contaBlockchain, gas: 500000 },
            (error, result) => {
                if(error) { fError(error); return false; }
                else { fSuccess(result); return true; }
            });
    }

    async invalidarCadastro(address: string, fSuccess: any, fError: any) {

        let contaBlockchain = await this.getCurrentAccountSync();    

        this.RBBRegistrySmartContract.invalidateRegistrySameOrg(address, 
            { from: contaBlockchain, gas: 500000 },
            (error, result) => {
                if(error) { fError(error); return false; }
                else { fSuccess(result); return true; }
            });
        return false;
    }

    

    getEstadoContaAsString(address: string, fSuccess: any, fError: any): string {
        let self = this;
        console.log("getEstadoContaAsString no web3:" + address);
        return this.RBBRegistrySmartContract.getAccountState(address, 
        (error, result) => {
            if(error) {
                console.log("Mensagem de erro ao chamar BNDESRegistry:");
                console.log(error);                
                fError(error);
            }
            else {
                console.log("Sucesso ao recuperar valor - getAccountState no web3:" + result);
                let str = self.getEstadoContaAsStringByCodigo (result);
                fSuccess(str);
            }   
        });
    }

    //Métodos de tradução back-front

    montaPJInfo(result): any {
        let pjInfo: any;

        console.log(result);
        
        pjInfo  = {};

        if ( result == undefined )
            return pjInfo; 

        pjInfo.rbbid = result[0];
        pjInfo.cnpj = result[1];
        pjInfo.hashDeclaracao = result[2];
        pjInfo.status = result[3].c[0];
        pjInfo.role = result[4].c[0];
        pjInfo.paused = result[5];
        pjInfo.dateTimeExpiration = result[6];
        //pjInfo.address = result[5];

        pjInfo.statusAsString = this.getEstadoContaAsStringByCodigo(pjInfo.status);
        pjInfo.roleAsString   = this.getPapelContaAsString(pjInfo.role);

        if (pjInfo.status == 2) {
            pjInfo.isValidada =  true;
        }
        else {
            pjInfo.isValidada = false;
        }


        if (pjInfo.status == 0) {
            pjInfo.isAssociavel =  true;
        }
        else {
            pjInfo.isAssociavel = false;
        }

        return pjInfo;
    }


    getEstadoContaAsStringByCodigo(result): string {
        if (result==100) {
            return "Conta Reservada";
        }
        else if (result==0) {
            return "Disponível";
        }
        else if (result==1) {
            return "Aguardando";
        }                
        else if (result==2) {
            return "Validada";
        }    
        else if (result==3) {
            return "Invalidada";
        }                                                        
        else {
            return "N/A";
        }        
    }


    getPapelContaAsString (result): string {
        if (result==0) {
            return "Regular";
        }
        else if (result==1) {
            return "Admin";
        }                
        else if (result==2) {
            return "Supadmin";
        }                                                  
        else {
            return "Indefinido";
        }        
    }


}