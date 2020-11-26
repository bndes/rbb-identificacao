const ethers  = require('ethers');
const express = require('express');
var fs        = require('fs');
var os        = require('os');
var request   = require('request');

var config    = require('./config.json');
var v_wallet  = require('./wallet.json');

var contrato_json_BNDESRegistry = require(config.infra.contrato_json_BNDESRegistry);

// const app = express();
// const port = 3000; //FIXME

const SERVER_FUNCTIONS     = require('./server_functions.js');

const privateKey = v_wallet.privkey;
const provider   = new ethers.providers.JsonRpcProvider('http://localhost:9545');
const wallet     = new ethers.Wallet(privateKey, provider);

let contractAddress = contrato_json_BNDESRegistry.networks[config.infra.rede_blockchain].address;

let RBBRegistry;

console.log("Oracle Validator at " + v_wallet.address);

initContract();
listenEvent();

async function initContract() {
            
    let abi = contrato_json_BNDESRegistry['abi'];
    RBBRegistry = new ethers.Contract(contractAddress, abi, provider);
    console.log("Contract RBBRegistry at " + contractAddress);

}

function completarCnpjComZero(cnpj){
    return ("00000000000000" + cnpj).slice(-14)
 }


async function listenEvent() {
    console.log("");
    console.log("Listening to event AccountRegistration ...");
    console.log("");
    RBBRegistry.on("AccountRegistration", async (addr, RBBId, CNPJ, hashProof, dateTimeExpiration) => {
    
        console.log(addr);    
        console.log(RBBId);    
        console.log(CNPJ);     
        console.log(hashProof);
        console.log(dateTimeExpiration);

        if ( hashProof == "0" ) {
            console.log("Conta Regular nao eh validada automaticamente. Ficara aguardando validacao manual.")
        } else {
            CNPJ = completarCnpjComZero(CNPJ);

            let RBBRegistryWithSigner = RBBRegistry.connect(wallet);
    
            try {
                let contrato = 0;
                let tipo = 'declaracao';
                let filePathAndNameToFront = await SERVER_FUNCTIONS.buscaTipoArquivo(CNPJ, contrato, addr, tipo, hashProof);
                console.log(filePathAndNameToFront);
                let tx = await RBBRegistryWithSigner.validateRegistry(addr);
                console.log(tx.hash);
                await tx.wait();
                console.log("O cadastro foi validado.");
            } catch(err) {
                
                console.log("Nao conseguiu encontrar o arquivo da declaracao.");
                let tx = await RBBRegistryWithSigner.invalidateRegistry(addr);
                console.log(tx.hash);
                await tx.wait();
                console.log("O cadastro foi invalidado.");
                
            }
        }

        

    });
}

async function checkIDStatus(id) {

let blockchainAccount = await RBBRegistry.getBlockchainAccounts (id);
let blockchainAccountStatus = await RBBRegistry.getAccountState(blockchainAccount[0]);

    console.log( { "id"      : id,
                 "address" : blockchainAccount, 
                 "status"  : blockchainAccountStatus
               } );
    
}



