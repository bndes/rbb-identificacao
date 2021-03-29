const ethers  = require('ethers');
require("dotenv").config();

let ownerWallet = getWallet('./ownerWallet.json', process.env.PASSWORD_OWNER_WALLET);
console.log("owner: " + ownerWallet.address);

//const preValidationWallet = getWallet('./prevalidationWallet.json', process.env.PASSWORD_PREVALIDATION_WALLET);
//console.log("addr do PreValidador: ", preValidationWallet.address);
//const preValidationAddress = preValidationWallet.address;
const preValidationAddress = "0x1baafa8a6ecab2b1d6c3683d480966233704e30c";

const provider  = new ethers.providers.JsonRpcProvider("http://35.239.231.134:4545/");

ownerWallet = ownerWallet.connect(provider);

if ( true ) {
    ownerWallet.getChainId().then( (chainId) => {
        console.log(chainId);
    }); 
}

const constractDoc = require('../Back-Blockchain/build/contracts/RBBRegistry.json');
const abiAsJson = constractDoc.abi;
const abi = JSON.stringify(abiAsJson);
const bytecode = constractDoc.bytecode;

const factory = new ethers.ContractFactory(abi, bytecode, ownerWallet);

if ( true ) {
    factory.deploy().then( async (rbbRegistrySmartContract) =>   {
/*
        rbbRegistrySmartContract.on("*", (event) => {
            console.log("event: ", event);
        });
*/
        console.log("Endereço do contrato: ", rbbRegistrySmartContract.address);
        rbbRegistrySmartContract.setResponsibleForRegistryPreValidation(preValidationAddress);



        //não adianta conferir resultado logo depois, mesmo se colocar await pq soh significa que a transacao foi enviada.
        //Por isso é necessário ter o timeout
    
        setTimeout(function(){ confereResultado(rbbRegistrySmartContract); }, 10000);
    
    });     
}

function getWallet(walletFileName, password) {

    const encyptedWallet = require (walletFileName);
    const wallet = ethers.Wallet.fromEncryptedJsonSync(JSON.stringify(encyptedWallet), password);
    return wallet;

}

async function confereResultado(rbbRegistrySmartContract) {
    const resp = (await rbbRegistrySmartContract.responsibleForRegistryPreValidation());
    if (resp.toLowerCase() == preValidationAddress.toLowerCase()) {
        console.log("Responsavel pela prevalidacao no contrato corretamente configurado");
    }
    else {
        console.log("ERRO - Responsavel pela prevalidacao no contrato NÃO FOI corretamente configurado");
        console.log(resp);
        console.log(preValidationAddress);

    }
}



