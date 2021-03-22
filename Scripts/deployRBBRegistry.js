const ethers  = require('ethers');
require("dotenv").config();

let ownerWallet = getWallet('./ownerWallet.json', process.env.PASSWORD_OWNER_WALLET);
const preValidationWallet = getWallet('./prevalidationWallet.json', process.env.PASSWORD_PREVALIDATION_WALLET);
console.log("addr do PreValidador: ", preValidationWallet.address);

const provider  = new ethers.providers.JsonRpcProvider("http://35.239.231.134:4545/");

ownerWallet = ownerWallet.connect(provider);

/*
ownerWallet.getChainId().then( (chainId) => {
    console.log(chainId);
}); 
*/

const constractDoc = require('../Back-Blockchain/build/contracts/RBBRegistry_v2.json');
const abiAsJson = constractDoc.abi;
const abi = JSON.stringify(abiAsJson);
const bytecode = constractDoc.bytecode;

const factory = new ethers.ContractFactory(abi, bytecode, ownerWallet);

//console.log(factory);

factory.deploy().then( async (deployedContractAddr) =>   {

    console.log("owner=" + ownerWallet.address);
    console.log("Endereço do contrato: ",deployedContractAddr.address);
//    console.log(deployedContractAddr.deployTransaction);
//    console.log(deployedContractAddr);
   
    let rbbRegistrySmartContract = new ethers.Contract(deployedContractAddr.address, abi, provider);
    rbbRegistrySmartContract = rbbRegistrySmartContract.connect(ownerWallet);

    rbbRegistrySmartContract.on("*", (event) => {
        console.log("event: ", event);
    });
    console.log("depois do on");
    
    await rbbRegistrySmartContract.setResponsibleForRegistryPreValidation(preValidationWallet.address);
    console.log("setou setResponsibleForRegistryPreValidation");

    //não adianta conferir resultado aqui, pois o await soh significa que a transacao foi enviada.
    //TODO: incluir timeout
});


function getWallet(walletFileName, password) {

    const encyptedWallet = require (walletFileName);
    const wallet = ethers.Wallet.fromEncryptedJsonSync(JSON.stringify(encyptedWallet), password);

//    console.log(wallet.address);
//    console.log(wallet.privateKey);
//    console.log(wallet.publicKey);

    return wallet;

}

async function confereResultado(rbbRegistrySmartContract) {
    const resp = (await rbbRegistrySmartContract.responsibleForRegistryPreValidation());
    console.log(preValidationWallet.address);
    console.log("Responsavel pela prevalidacao no contrato = " + resp);

}



