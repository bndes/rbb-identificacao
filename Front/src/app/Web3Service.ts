import { Injectable  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConstantesService } from './ConstantesService';
import { formattedError } from '@angular/compiler';
import { Utils } from 'src/utils';
import {ethers} from 'ethers';
import MetaMaskOnboarding from "@metamask/onboarding"
import { async } from 'rxjs';

@Injectable()
export class Web3Service {

    private serverUrl: string;

    private RBBRegistryAddress: string = '';
    private blockchainNetwork: string = '';
    private ethereum: any;

    private RBBRegistrySmartContract: any;

    // Application Binary Interface so we can use the question contract
    private ABIRBBRegistry;

    private vetorTxJaProcessadas : any[];


    private eventoBNDESRegistry: any;
    private eventoCadastro: any;
    private eventoTransacao: any;

    //private provider: any;

    private netVersion: any;
    private accountProvider: any;
    private URLBlockchainProvider: string;
    private onboarding = new MetaMaskOnboarding();


    constructor(private http: HttpClient, private constantes: ConstantesService) {

        this.vetorTxJaProcessadas = [];

        this.serverUrl = ConstantesService.serverUrl;
        console.log("Web3Service.ts :: Selecionou URL = " + this.serverUrl)

        this.http.post<Object>(this.serverUrl + 'constantesFront', {}).subscribe(
            data => {

                this.RBBRegistryAddress      = data["addrContratoBNDESRegistry"];
                this.blockchainNetwork       = data["blockchainNetwork"];
                this.ABIRBBRegistry          = data['abiBNDESRegistry'];
                this.URLBlockchainProvider   = data["URLBlockchainProvider"];

                this.intializeWeb3();

            },
            error => {
                console.log("**** Erro ao buscar constantes do front");
                console.log(error);
            });

    }

    async intializeWeb3() {
        console.log("this.URLBlockchainProvider ao inicializar web3 = " + this.URLBlockchainProvider);


        console.log("this.URLBlockchainProvider = " + this.URLBlockchainProvider);
        //this.provider = new ethers.providers.JsonRpcProvider(this.URLBlockchainProvider);

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

        //this.RBBRegistrySmartContract = new ethers.Contract(this.RBBRegistryAddress, this.ABIRBBRegistry, this.provider);
        this.RBBRegistrySmartContract = new ethers.Contract(this.RBBRegistryAddress, this.ABIRBBRegistry, this.accountProvider );
        
        console.log("INICIALIZOU O WEB3");
        console.log("BNDESRegistry=");
        console.log(this.RBBRegistrySmartContract);

    }

    async changeNetwork(){
        await this.intializeWeb3();
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

    public async getCurrentAccountSync() {
        /* if (this.accountProvider.getSigner() != undefined)
            return this.accountProvider.getSigner().getAddress();
        else {
            //console.log("getCurrentAccountSync waiting for getSigner");
            return undefined;
        }
        
 */         
        var address = await this.ethereum.request({ method: 'eth_accounts' });
        
        
       
        if(address && address.length != 0){
          var stringAddress = address.toString();
          var checksumAddress = ethers.utils.getAddress(stringAddress);
          return checksumAddress;
        } else{
           return undefined;
        }

    }



    conectar () {
        this.ethereum.enable();
    }
    async recuperaEventos(){
        let filter =[ this.RBBRegistrySmartContract.filters.AccountRegistration(null),
         this.RBBRegistrySmartContract.filters.AccountValidation(null),
         this.RBBRegistrySmartContract.filters.AccountInvalidation(null),
         this.RBBRegistrySmartContract.filters.AccountRoleChange(null),
         this.RBBRegistrySmartContract.filters.AccountPaused(null),
         this.RBBRegistrySmartContract.filters.AccountUnpaused(null)];

        return await this.RBBRegistrySmartContract.queryFilter(filter);
    }
    async recuperaNovosEventos(caller, func){
        this.RBBRegistrySmartContract.on("*", (event) => {

            //ListaEventos.registraNovoEvento(event,this, caller);
            func(event,this, caller);
          });

    }

    async recuperaEventosCadastro() {
        let filter = this.RBBRegistrySmartContract.filters.AccountRegistration(null);
        return await this.RBBRegistrySmartContract.queryFilter(filter);
    }

    async recuperaEventosValidacao() {
        let filter = this.RBBRegistrySmartContract.filters.AccountValidation(null);
        return await this.RBBRegistrySmartContract.queryFilter(filter);
    }

    async recuperaEventosInvalidacao() {
        let filter = this.RBBRegistrySmartContract.filters.AccountInvalidation(null);
        return await this.RBBRegistrySmartContract.queryFilter(filter);
    }

    async recuperaEventosTroca() {
        let filter = this.RBBRegistrySmartContract.filters.AccountRoleChange(null);
        return await this.RBBRegistrySmartContract.queryFilter(filter);
    }

    async recuperaEventosPausa() {
        let filter = this.RBBRegistrySmartContract.filters.AccountPaused(null);
        return await this.RBBRegistrySmartContract.queryFilter(filter);
    }

    async recuperaEventosDespausa() {
        let filter = this.RBBRegistrySmartContract.filters.AccountUnpaused(null);
        return await this.RBBRegistrySmartContract.queryFilter(filter);
    }

    registraWatcherEventosLocal(txHashProcurado, callback) {
        
        this.accountProvider.once(txHashProcurado, (receipt) => {
            console.log('Transaction Mined: ' + receipt.hash);
            console.log(receipt);
            callback();
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
async ReValidarAdmin(cnpj: number, hashdeclaracao: string): Promise<any>  {
    let contaBlockchain = await this.getCurrentAccountSync();

    console.log("Web3Service - Cadastra")
    console.log("CNPJ: " + cnpj +
    ", hashdeclaracao: " + hashdeclaracao
    )

    hashdeclaracao = hashdeclaracao.replace("0x","").toLowerCase(); //ICF_V2
    console.log("hashdeclaracao alterado:" + hashdeclaracao);

    const signer = this.accountProvider.getSigner();
    const contWithSigner = this.RBBRegistrySmartContract.connect(signer);
    return (await contWithSigner.revalidateAccount(hashdeclaracao));
}

async ReValidarRegular(cnpj: number, hashdeclaracao: string): Promise<any>  {
    let contaBlockchain = await this.getCurrentAccountSync();

    console.log("Web3Service - Cadastra")
    console.log("CNPJ: " + cnpj +
    ", hashdeclaracao: " + hashdeclaracao
    )

    hashdeclaracao = hashdeclaracao.replace("0x","").toLowerCase(); //ICF_V2
    console.log("hashdeclaracao alterado:" + hashdeclaracao);

    const signer = this.accountProvider.getSigner();
    const contWithSigner = this.RBBRegistrySmartContract.connect(signer);
    return (await contWithSigner.revalidateForRegularAccounts());
}

    async cadastra(cnpj: number, hashdeclaracao: string): Promise<any>  {

        let contaBlockchain = await this.getCurrentAccountSync();

        console.log("Web3Service - Cadastra")
        console.log("CNPJ: " + cnpj +
            ", hashdeclaracao: " + hashdeclaracao
            )

        hashdeclaracao = hashdeclaracao.replace("0x","").toLowerCase(); //ICF_V2
        console.log("hashdeclaracao alterado:" + hashdeclaracao);

        const signer = this.accountProvider.getSigner();
        const contWithSigner = this.RBBRegistrySmartContract.connect(signer);
        return (await contWithSigner.registryLegalEntity(cnpj, hashdeclaracao));

    }

    async pause(contaBlockchain: string) {
        let responsavel = await this.getCurrentAccountSync();

        console.log("Web3Service - Pause");
        console.log("Conta Blockchain: " + contaBlockchain );
        let usuarioVetor = await this.identificaUsuario();
        console.log(usuarioVetor);
        
        let usuario = usuarioVetor[0];
        let usuarioEndereco = usuarioVetor[1];
        
        
        try {
            const signer = this.accountProvider.getSigner();
            const contWithSigner = this.RBBRegistrySmartContract.connect(signer);
            
            if ( await this.isResponsibleForMonitoring( usuarioEndereco ) ) {
                console.log(contaBlockchain);
                
                (await contWithSigner.pauseAddressAfterMonitoring(contaBlockchain));
                

                return true;
            }

            if ( usuario.roleAsString == "Admin" ) {
                (await contWithSigner.pauseAddressSameOrg(contaBlockchain));
                return true;
            }
            if ( usuario.roleAsString == "Regular" ) {
                (await contWithSigner.pauseAddressSameOrg(contaBlockchain));
                return true;
            }
            

        } catch (error) {
            console.log("pause:" )
            console.log( error);
            return false;
        }

    }

    async unpause(contaBlockchain: string) {
        let usuarioVetor = await this.identificaUsuario();
        let usuario = usuarioVetor[0];
        let usuarioEndereco = usuarioVetor[1];

        console.log("Web3Service - Unpause");
        console.log("Conta Blockchain: " + contaBlockchain );

        try {
            const signer = this.accountProvider.getSigner();
            const contWithSigner = this.RBBRegistrySmartContract.connect(signer);

            if ( usuario.roleAsString == "Admin" ) {
                (await contWithSigner.unpauseAddressSameOrg(contaBlockchain));
                return true;
            }
            if ( this.isResponsibleForMonitoring( usuarioEndereco ) ) {
                (await contWithSigner.unpauseAddressAfterMonitoring(contaBlockchain));
                return true;
            }

        } catch (error) {
            console.log("unpause:" )
            console.log( error);
            return false;
        }

    }

    async pauseLegalEntity(rbbid: number) {
        let usuarioVetor = await this.identificaUsuario();
        let usuario = usuarioVetor[0];
        let usuarioEndereco = usuarioVetor[1];

        console.log("Web3Service - pauseLegalEntity");
        console.log("RBBId: " + rbbid );
        
        console.log(usuarioEndereco);
        try {
            const signer = this.accountProvider.getSigner();
            const contWithSigner = this.RBBRegistrySmartContract.connect(signer);
            
            if ( rbbid == parseInt(usuario.rbbid,16)) {
                
                (await contWithSigner.pauseLegalEntitySameOrg());
                return true;
            }
            if ( this.isResponsibleForMonitoring( usuarioEndereco ) ) {
                
                (await contWithSigner.pauseLegalEntityAfterMonitoring(rbbid));
                return true;
            }

        } catch (error) {
            console.log("pauseLegalEntity:" )
            console.log( error);
            return false;
        }
    }

    async identificaUsuario() {
        let usuarioEndereco = await this.getCurrentAccountSync();
        let usuario = await this.getPJInfo(usuarioEndereco);
        return [usuario, usuarioEndereco];
    }

    async validarCadastro(address: string) {
        console.log("Web3Service - validarCadastro");
        console.log("address: " + address );
        let usuarioVetor = await this.identificaUsuario();
        let usuario = usuarioVetor[0];
        let usuarioEndereco = usuarioVetor[1];

        try {
            const signer = this.accountProvider.getSigner();
            const contWithSigner = this.RBBRegistrySmartContract.connect(signer);

            if ( usuario.roleAsString == "Admin" ) {
                (await contWithSigner.validateRegistrySameOrg(address));
                return true;
            }
            if ( this.isResponsibleForRegistryValidation( usuarioEndereco ) ) {
                (await contWithSigner.validateRegistry(address));
                return true;
            }

            throw "Usuário não tem permissão para validar conta";

        } catch (error) {
            console.log("validarCadastro:" )
            console.log( error);
            return false;
        }
    }

    async invalidarCadastro(address: string) {
        console.log("Web3Service - invalidarCadastro");
        console.log("address: " + address );
        let usuarioVetor = await this.identificaUsuario();
        let usuario = usuarioVetor[0];
        let usuarioEndereco = usuarioVetor[1];
        console.log("usuarioEndereco: " + usuarioEndereco );
        try {
            const signer = this.accountProvider.getSigner();
            const contWithSigner = this.RBBRegistrySmartContract.connect(signer);

            if ( usuarioEndereco === address ) {
                (await contWithSigner.invalidateYourOwnAddress());
                return true;
            }
            console.log("Web3Service - invalidarCadastro - Nao eh invalidateYourOwnAddress");
            if ( usuario.roleAsString == "Admin" ) {
                (await contWithSigner.invalidateAddressSameOrg(address));
                return true;
            }
            console.log("Web3Service - invalidarCadastro - Nao eh invalidateAddressSameOrg");
            if ( this.isResponsibleForRegistryValidation( usuarioEndereco ) ) {
                (await contWithSigner.invalidateAddress(address));
                return true;
            }
            console.log("Web3Service - invalidarCadastro - Nao eh invalidateAddress");
            if ( this.isResponsibleForMonitoring( usuarioEndereco ) ) {
                (await contWithSigner.invalidateAddressAfterMonitoring(address));
                return true;
            }
            console.log("Web3Service - invalidarCadastro - Nao eh invalidateAddressAfterMonitoring");

            throw "Usuário não tem permissão para invalidar conta";

        } catch (error) {
            console.log("invalidarCadastro:" )
            console.log( error);
            return false;
        }
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
        let block = await this.accountProvider.getBlock(blockNumber);
        return block.timestamp;
    }

    async isResponsibleForRegistryValidation(address: string): Promise<boolean> {

        let enderecoDoResponsavelPelaValidacao = await this.RBBRegistrySmartContract.responsibleForRegistryValidation();
        console.log("isResponsibleForRegistryValidation");
        console.log("enderecoDoResponsavelPelaValidacao= " +enderecoDoResponsavelPelaValidacao);
        console.log("address= " +address);
        let comparacao =  ( enderecoDoResponsavelPelaValidacao == address );
        console.log("comparacao= " +comparacao);

        return comparacao;
    }

    async isResponsibleForMonitoring(address: string): Promise<boolean> {

        let enderecoDoResponsavelPelaMonitoracao = await this.RBBRegistrySmartContract.responsibleForActingAfterMonitoring();
        console.log("isResponsibleForMonitoring");
        console.log("enderecoDoResponsavelPelaMonitoracao= " +enderecoDoResponsavelPelaMonitoracao);
        console.log("address= " +address);
        let comparacao =  ( enderecoDoResponsavelPelaMonitoracao == address );
        console.log("comparacao= " +comparacao);

        return comparacao;
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

    async getEstadoContaAsString(address: string): Promise<string> {
        let self = this;

        let result =  await this.RBBRegistrySmartContract.getAccountState(address);
        let str = self.getEstadoContaAsStringByCodigo (result);
        return str;

    }

    //Checar se Metamask esta instalado
    public onClickInstall(){
        this.onboarding.startOnboarding();
    };

    async onClickConnect(){
        try {
          await this.ethereum.request({ method: 'eth_requestAccounts' });
        } catch (error) {
          console.error(error);
        }
    };

    //Métodos de tradução back-front

    montaPJInfo(result): any {
        let pjInfo: any;

        //console.log("montaPJInfo");
        //console.log(result);

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
            return "Pré-Validada";
        }
        else if (result==3) {
            return "Pré-Invalidada";
        }
        else if (result==4) {
            return "Validada";
        }
        else if (result==5) {
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
