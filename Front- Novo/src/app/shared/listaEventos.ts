import { DashboardPessoaJuridica } from '../DashboardPessoaJuridica';
import { Utils } from './utils';

export class ListaEventos {

    static async registraEventosCadastro(web3Service, caller) {
        let self = this;

        console.log("*** ListaContas: Executou o metodo de registrar eventos CADASTRO ");

        web3Service.recuperaEventosCadastro().then(async function (eventos) {
            console.log("recuperaEventosCadastro().then");
            for (let i = 0; i < eventos.length; i++) {
                await ListaEventos.processaEventoCadastro(eventos[i], caller);
            }
        });
    }

    static async processaEventoCadastro(event, self) {
        let transacaoPJ: DashboardPessoaJuridica;
        let eventoCadastro = event;

        console.log("Evento Cadastro");
        console.log(eventoCadastro);

        transacaoPJ = {
            RBBId: eventoCadastro.args.RBBId,
            cnpj: Utils.completarCnpjComZero(eventoCadastro.args.CNPJ),
            razaoSocial: "",
            contaBlockchain: eventoCadastro.args.addr,
            hashID: eventoCadastro.transactionHash,
            uniqueIdentifier: eventoCadastro.transactionHash,
            dataHora: eventoCadastro.dateTimeExpiration,
            hashDeclaracao: eventoCadastro.args.hashProof,
            evento: "Cadastro",
            status: "",
            acao: -1,
            filePathAndName: "",
            perfil: "",
            pausada: ""
        }

        self.includeIfNotExists(transacaoPJ);
        self.recuperaInfoDerivadaPorCnpj(self, transacaoPJ);
        self.recuperaDataHora(self, event, transacaoPJ);
        self.recuperaFilePathAndName(self, transacaoPJ);

        let registro = await self.recuperaRegistroBlockchain(transacaoPJ.contaBlockchain);
        transacaoPJ.perfil = registro.roleAsString;
        transacaoPJ.status = registro.statusAsString;
        transacaoPJ.acao = registro.status;
        transacaoPJ.pausada = registro.paused;

    }

    static async registraEventosTroca(web3Service, caller) {

        console.log("*** Executou o metodo de registrar eventos upgrade para Admin");

        let self = this;

        web3Service.recuperaEventosTroca().then(async function (eventos) {
            console.log("recuperaEventosTroca().then");
            for (let i = 0; i < eventos.length; i++) {
                await ListaEventos.processaEventoTroca(eventos[i], caller);
            }
        });
    }

    static async processaEventoTroca(event, self) {
        let transacaoPJ: DashboardPessoaJuridica
        let eventoTroca = event;

        console.log("Evento upgrade Admin");
        console.log(eventoTroca);

        let transacaoPJContaInativada = {
            cnpj: Utils.completarCnpjComZero(eventoTroca.args.CNPJ),
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
        self.recuperaFilePathAndName(self, transacaoPJContaInativada);

        let registro = await self.recuperaRegistroBlockchain(transacaoPJ.contaBlockchain);
        transacaoPJ.perfil = registro.roleAsString;
        transacaoPJ.status = registro.statusAsString;
        transacaoPJ.acao = registro.status;
        transacaoPJ.pausada = registro.paused;


        transacaoPJ = {
            cnpj: Utils.completarCnpjComZero(eventoTroca.args.CNPJ),
            RBBId: eventoTroca.args.RBBId,
            razaoSocial: "",
            contaBlockchain: eventoTroca.args.newAddr,
            hashID: eventoTroca.transactionHash,
            uniqueIdentifier: eventoTroca.transactionHash + "New",
            dataHora: null,
            hashDeclaracao: eventoTroca.args.hashProof,
            evento: "Troca",
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
        self.recuperaFilePathAndName(self, transacaoPJ);

        registro = await self.recuperaRegistroBlockchain(transacaoPJ.contaBlockchain);
        transacaoPJ.perfil = registro.roleAsString;
        transacaoPJ.status = registro.statusAsString;
        transacaoPJ.acao = registro.status;
        transacaoPJ.pausada = registro.paused;

    }

    static async registraEventosValidacao(caller, web3Service) {

        console.log("*** Executou o metodo de registrar eventos VALIDACAO");

        let self = this;

        web3Service.recuperaEventosValidacao().then(async function (eventos) {
            console.log("recuperaEventosValidacao().then");
            for (let i = 0; i < eventos.length; i++) {
                await ListaEventos.processaEventoGenerico(eventos[i], "Validação", caller);
            }
        });

    }

    static async registraEventosInvalidacao(caller, web3Service) {

        console.log("*** Executou o metodo de registrar eventos INVALIDACAO");

        let self = this;

        web3Service.recuperaEventosInvalidacao().then(async function (eventos) {
            console.log("recuperaEventosInvalidacao().then");
            for (let i = 0; i < eventos.length; i++) {
                await ListaEventos.processaEventoGenerico(eventos[i], "Invalidação", caller);
            }
        });

    }

    static async registraEventosPausa(caller, web3Service) {

        console.log("*** Executou o metodo de registrar eventos Pausa");

        let self = this;

        web3Service.recuperaEventosPausa().then(async function (eventos) {
            console.log("recuperaEventosPausa().then");
            for (let i = 0; i < eventos.length; i++) {
                await ListaEventos.processaEventoGenerico(eventos[i], "Pausa", caller);
            }
        });

    }

    static async registraEventosDespausa(caller, web3Service) {

        console.log("*** Executou o metodo de registrar eventos Despausa");

        let self = this;

        web3Service.recuperaEventosDespausa().then(async function (eventos) {
            console.log("recuperaEventosDespausa().then");
            for (let i = 0; i < eventos.length; i++) {
                await ListaEventos.processaEventoGenerico(eventos[i], "Despausa", caller);
            }
        });

    }

    static async processaEventoGenerico(event, nomeEvento, self) {
        let transacaoPJ: DashboardPessoaJuridica;

        console.log("Evento " + nomeEvento);
        console.log(event);

        transacaoPJ = {
            RBBId: event.args.RBBId,
            cnpj: Utils.completarCnpjComZero(event.args.CNPJ),
            razaoSocial: "",
            contaBlockchain: event.args.addr,
            hashID: event.transactionHash,
            uniqueIdentifier: event.transactionHash,
            dataHora: null,
            hashDeclaracao: "",
            evento: nomeEvento,
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
        //self.recuperaFilePathAndName(self,transacaoPJ);                

        let registro = await self.recuperaRegistroBlockchain(transacaoPJ.contaBlockchain);
        transacaoPJ.perfil = registro.roleAsString;
        transacaoPJ.status = registro.statusAsString;
        transacaoPJ.acao = registro.status;
        transacaoPJ.pausada = registro.paused;

    }
}