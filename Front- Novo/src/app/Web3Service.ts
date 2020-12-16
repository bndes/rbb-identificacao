import { Injectable  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConstantesService } from './ConstantesService';
import { formattedError } from '@angular/compiler';
import { Utils } from 'src/utils';
import {ethers} from 'ethers';

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

    private provider: any;
    private netVersion: any;
    private accountProvider: any;
    private URLBlockchainProvider: string;

    constructor(private http: HttpClient, private constantes: ConstantesService) {
       
        this.vetorTxJaProcessadas = [];

        this.serverUrl = ConstantesService.serverUrl;
        console.log("Web3Service.ts :: Selecionou URL = " + this.serverUrl)

        this.http.post<Object>(this.serverUrl + 'constantesFront', {}).subscribe(
            data => {

                this.RBBRegistryAddress = data["addrContratoBNDESRegistry"];
                this.blockchainNetwork = data["blockchainNetwork"];
                this.ABIRBBRegistry = data['abiBNDESRegistry'];
                this.URLBlockchainProvider = data["URLBlockchainProvider"];

                console.log("abis");
                console.log(this.ABIRBBRegistry);

                this.intializeWeb3();

            },
            error => {
                console.log("**** Erro ao buscar constantes do front");
            });
            
    }

    async intializeWeb3() {

        console.log("this.URLBlockchainProvider = " + this.URLBlockchainProvider);
        this.provider = new ethers.providers.JsonRpcProvider(this.URLBlockchainProvider);
        this.ethereum =  window['ethereum'];

        this.netVersion = await this.ethereum.request({
            method: 'net_version',
        });
        console.log(this.netVersion);

        this.accountProvider = new ethers.providers.Web3Provider(this.ethereum);

        console.log("accountProvider=");
        console.log(this.accountProvider);        

        console.log("INICIALIZOU O WEB3 - RBBRegistryAddress abaixo");
        console.log("this.RBBRegistryAddress=" + this.RBBRegistryAddress);

        this.RBBRegistrySmartContract = new ethers.Contract(this.RBBRegistryAddress, this.ABIRBBRegistry, this.provider);

        console.log("INICIALIZOU O WEB3 - bndesTokenContract abaixo");
        console.log("BNDESToken=");
        //console.log(this.bndesTokenSmartContract);        
        console.log("BNDESRegistry=");
        console.log(this.RBBRegistrySmartContract);

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
        if ( this.accountProvider == undefined ) this.intializeWeb3();
        return this.accountProvider.getSigner().getAddress();
    }


//     private intializeWeb3OLD(): void {

//         if (typeof window['web3'] !== 'undefined') {
//             this.ethereum =  window['ethereum'];
//             console.log("ethereum=");
//             console.log(this.ethereum);
//             this.web3 = new this.Web3(window['web3'].currentProvider);
//             console.log("Conectado com noh");
    
//         } else {
//             console.log('Using HTTP node --- nao suportado');
//             return; 
//         }

//         //this.bndesTokenSmartContract = this.web3.eth.contract(this.ABIBndesToken).at(this.addrContratoBNDESToken);
//         this.RBBRegistrySmartContract = this.web3.eth.contract(this.ABIRBBRegistry).at(this.RBBRegistryAddress);

//         console.log("INICIALIZOU O WEB3 - bndesTokenContract abaixo");
//         console.log("BNDESToken=");
//         //console.log(this.bndesTokenSmartContract);        
//         console.log("BNDESRegistry=");
//         console.log(this.RBBRegistrySmartContract);

//         let self = this;

//         this.getAddressOwner(function (addrOwner) {
//             console.log("Owner Addr =" + addrOwner);
//             self.addressOwner = addrOwner;
//         }, function (error) {
//             console.log("Erro ao buscar owner=" + error);
//         });

// }

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
        this.RBBRegistrySmartContract.on("AccountRegistration", () => {
            callback;
        });
    }
    registraEventosValidacao(callback) {
        this.RBBRegistrySmartContract.on("AccountValidation", () => {
            callback;
        });
    }
    registraEventosInvalidacao(callback) {
        this.RBBRegistrySmartContract.on("AccountInvalidation", () => {
            callback;
        });
    }    
    registraEventosRoleChange(callback) {
        this.RBBRegistrySmartContract.on("AccountRoleChange", () => {
            callback;
        })
    }
    registraEventosPausa(callback) {        
        this.RBBRegistrySmartContract.on("AccountPaused", () => {
            callback;
        })
    }
    registraEventosDespausa(callback) {
        this.RBBRegistrySmartContract.on("AccountUnpaused", () => {
            callback;
        })
    }
    
    registraWatcherEventosLocal(txHashProcurado, callback) {
        this.provider.once(txHashProcurado, (receipt) => {
            console.log('Transaction Mined: ' + receipt.hash);
            console.log(receipt);
            callback;
        });

        /*
        let self = this;
        console.info("Callback ", callback);
        const filtro = { fromBlock: 'latest', toBlock: 'pending' }; 

        this.eventoBNDESRegistry = this.RBBRegistrySmartContract.allEvents( filtro );                 
        this.eventoBNDESRegistry.watch( function (error, result) {
            console.log("Watcher BNDESRegistry executando...")
            self.procuraTransacao(error, result, txHashProcurado, self, callback);
        });
     
        console.log("registrou o watcher de eventos");
        */
    }

    /*
    procuraTransacao(error, result, txHashProcurado, self, callback) {
        console.log( "Entrou no procuraTransacao" );
        console.log( "txHashProcurado: " + txHashProcurado );
        console.log( "result.transactionHash: " + result.transactionHash );
        self.provider.getTransactionReceipt(txHashProcurado,  function (error, result) {
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
*/

    async cadastra(cnpj: number, hashdeclaracao: string): Promise<any>  {

        let contaBlockchain = await this.getCurrentAccountSync();    
        
        console.log("Web3Service - Cadastra")
        console.log("CNPJ: " + cnpj +  
            ", hashdeclaracao: " + hashdeclaracao 
            )

        const signer = this.accountProvider.getSigner();
        const contWithSigner = this.RBBRegistrySmartContract.connect(signer);
        return (await contWithSigner.registryLegalEntity(cnpj, hashdeclaracao));
    
    }

    async pause(contaBlockchain: string) {
        let responsavel = await this.getCurrentAccountSync();    
        
        console.log("Web3Service - Pause");
        console.log("Conta Blockchain: " + contaBlockchain );

        const signer = this.accountProvider.getSigner();
        const contWithSigner = this.RBBRegistrySmartContract.connect(signer);
        return (await contWithSigner.pauseAddress(contaBlockchain));

    }

    async unpause(contaBlockchain: string) {
        let responsavel = await this.getCurrentAccountSync();    
        
        console.log("Web3Service - Unpause");
        console.log("Conta Blockchain: " + contaBlockchain );

        const signer = this.accountProvider.getSigner();
        const contWithSigner = this.RBBRegistrySmartContract.connect(signer);
        return (await contWithSigner.unpauseAddress(contaBlockchain));

    }

    async pauseLegalEntity(rbbid: number) {
        let responsavel = await this.getCurrentAccountSync();    
        
        console.log("Web3Service - pauseLegalEntity");
        console.log("RBBId: " + rbbid );

        const signer = this.accountProvider.getSigner();
        const contWithSigner = this.RBBRegistrySmartContract.connect(signer);
        return (await contWithSigner.pauseLegalEntity(rbbid));            
    }

    async getId(address: string): Promise<number> {
        let result = await this.RBBRegistrySmartContract.getId(address); 
        return result;
    }

    async getPJInfo(address: string): Promise<any> {
       let result = await this.RBBRegistrySmartContract.getRegistry(address); 
       let pjInfo = this.montaPJInfo(result);
       pjInfo.address = address; //apendice com endereco
       return pjInfo;
    }   

    async getAddressOwner(): Promise<number> {
        return this.RBBRegistrySmartContract.owner();
    }

    async getBlockTimestamp(blockNumber: number) {
        let block = await this.provider.getBlock(blockNumber);
        return block.timestamp;
    }      

    async isResponsibleForRegistryValidation(address: string): Promise<boolean> {
        return await this.RBBRegistrySmartContract.isSortOfAdmin(address);
    }  

    async isContaDisponivel(address: string): Promise<boolean> {
        let result = await this.RBBRegistrySmartContract.isAvailableAccount(address); 
        return result;
    }

    async isContaAguardandoValidacao(address: string): Promise<boolean> {
        return await this.RBBRegistrySmartContract.isWaitingValidationAccount(address); 
    }

    async isContaValidada(address: string): Promise<boolean> {
        return await this.RBBRegistrySmartContract.isValidatedAccount(address);
    }

    async validarCadastro(address: string) {        
        return await this.RBBRegistrySmartContract.validateRegistrySameOrg(address);
    }

    async invalidarCadastro(address: string) { 
        return await this.RBBRegistrySmartContract.invalidateRegistrySameOrg(address);
    }

    

    async getEstadoContaAsString(address: string): Promise<string> {
        let self = this;

        let result =  await this.RBBRegistrySmartContract.getAccountState(address); 
        let str = self.getEstadoContaAsStringByCodigo (result);
        return str;
        
    }

    //Métodos de tradução back-front

    montaPJInfo(result): any {
        let pjInfo: any;

        console.log("montaPJInfo");
        console.log(result);
        
        pjInfo  = {};

        if ( result == undefined )
            return pjInfo; 

        pjInfo.rbbid = result[0];
        pjInfo.cnpj = result[1];
        pjInfo.hashDeclaracao = result[2];
        pjInfo.status = result[3];
        pjInfo.role = result[4];
        pjInfo.paused = result[5];
        pjInfo.dateTimeExpiration = result[6];
        //pjInfo.address = result[5];

        pjInfo.statusAsString = this.getEstadoContaAsStringByCodigo(pjInfo.status);
        pjInfo.roleAsString   = this.getPapelContaAsString(pjInfo.role);

        if ( pjInfo.cnpj != undefined ) {
            pjInfo.cnpj = Utils.completarCnpjComZero(pjInfo.cnpj);
        }

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