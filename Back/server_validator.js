const ethers  = require('ethers');
const express = require('express');
var fs        = require('fs');
var os        = require('os');
var request   = require('request');

var config    = require('./config.json');

const app = express();
const port = 3000; //FIXME

const privateKey = "0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d"; //FIXME
//publickey => 0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1
const wallet     = new ethers.Wallet(privateKey);
const valueInETH = "1.00"; //FIXME
const gasLimit   = "53000"; //FIXME
//const provider   = ethers.getDefaultProvider('rinkeby');    
//const provider   = new ethers.providers.JsonRpcProvider();// Default: http://localhost:8545 //FIXME
const provider   = new ethers.providers.JsonRpcProvider('http://localhost:9545');

//requestETH('0x840629315b87406fFB85b56A2EF4A3db57A94AC7');
checkIDStatus(1);

async function checkIDStatus(id) {
        
    // The Contract interface
    let abi = [
        "constructor (uint CNPJSUPADMIN, string  proofHashSUPADMIN, uint daysToExpire) public ",                
        "event AccountRegistration       (address addr, uint RBBId, uint CNPJ, bytes32 hashProof, uint256 dateTimeExpiration)",
        "event AccountValidation         (address addr, uint RBBId, uint CNPJ, address responsible)",
        "event AccountInvalidation       (address addr, uint RBBId, uint CNPJ, address responsible)",
        "event AccountPaused             (address addr, uint RBBId, uint CNPJ, address responsible)",
        "event AccountUnpaused           (address addr, uint RBBId, uint CNPJ, address responsible)",
        "event AccountRoleChange         (address addr, uint RBBId, uint CNPJ, address responsible, uint roleBefore, uint roleNew)",
        "event RegistryExpirationChange  (address addr, uint256 dateTimeExpirationBefore, uint256 dateTimeExpirationNew)",
        "function registryLegalEntity(uint CNPJ, bytes32 CNPJProofHash) public ",
        "function validateRegistrySameOrg(address userAddr) public onlyWhenNotPaused onlyWhenNotExpired ",
        "function validateRegistry(address userAddr) public onlyWhenNotPaused onlyWhenNotExpired ",
        "function pauseAddress(address addr) public onlyWhenNotPaused ",
        "function pauseLegalEntity(uint RBBId) public onlyWhenNotPaused ",
        "function unpauseAddress(address addr) public onlyWhenNotPaused onlyWhenNotExpired ",
        "function invalidateRegistry(address addr) public onlyWhenNotPaused onlyWhenNotExpired ",
        "function isSortOfAdmin(address addr) public view returns (bool) ",
        "function isOwner(address addr) public view returns (bool) ",
        "function isAvailableAccount(address addr) public view returns (bool) ",
        "function isWaitingValidationAccount(address addr) public view returns (bool) ",
        "function isValidatedAccount(address addr) public view returns (bool) ",
        "function isInvalidated(address addr) public view returns (bool) ",
        "function isTheSameID(address a, address b) public view returns (bool) ",
        "function isPaused(address addr) public view returns (bool) ",
        "function isOperational(address addr) public view returns (bool) ",
        "function isRegistryOperational(uint RBBId) public view returns (bool) ",
        "function getId (address addr) public view returns (uint) ",
        "function getRBBIdRaw (address addr) public view returns (uint) ",
        "function getCNPJ (address addr) public view returns (uint) ",
        "function getRegistry (address addr) public view returns (uint, uint, bytes32, uint, uint, bool, uint256) ",
        "function getBlockchainAccounts(uint RBBId) public view returns (address[] memory) ",
        "function getAccountState(address addr) public view returns (int) ",
        "function getAccountRole(address addr) public view returns (int) ",
        "function getIdFromCNPJ(uint cnpj) public view returns (uint) ",
        "function setRoleSupAdmin(address addr) public onlyOwner ",
        "function setDefaultDateTimeExpiration(uint256 dateTimeExpirationNew) public ",
        "function calculaProximoRBBID(uint CNPJ) private returns (uint) "
    ];

// Connect to the network
//let provider = ethers.getDefaultProvider();

// The address from the above deployment example
let contractAddress = "0xeFDE680898e90cf837ef7D372021df4AAAecaE87";

// We connect to the Contract using a Provider, so we will only
// have read-only access to the Contract
let contract = new ethers.Contract(contractAddress, abi, provider);

let blockchainAccount = await contract.getBlockchainAccounts (id);
let blockchainAccountStatus = await contract.getAccountState(blockchainAccount[0]);

    console.log( { "id"      : id,
                 "address" : blockchainAccount, 
                 "status"  : blockchainAccountStatus
               } );
    
}


function requestETH( _addressto ) {    
    var gasPricePromise         = provider.getGasPrice();
    var balancePromise          = provider.getBalance(wallet.address);    
    var transactionCountPromise = provider.getTransactionCount(wallet.address);

    var allPromises = Promise.all([
        gasPricePromise,
        balancePromise,
        transactionCountPromise
    ]);

    var sendPromise = allPromises.then(
        function(results) {    
            var gasPrice         = results[0];
            var balance          = results[1];
            var transactionCount = results[2];
           
            var value = ethers.utils.parseEther(valueInETH);

            var transaction = {
                to: _addressto,
                gasPrice: gasPrice,
                gasLimit: ethers.utils.bigNumberify(gasLimit),
                nonce: transactionCount,

                // The amount to send
                value: value,

                // Prevent replay attacks across networks
                chainId: provider.chainId,
            };

            var signedTransaction = wallet.sign(transaction);

            // By returning a Promise, the sendPromise will resolve once the
            // transaction is sent
            console.log("The transaction promise was made."); 
            console.log("The current balance is " + balance);             
            return provider.sendTransaction(signedTransaction);
        }
    );

    // This will be called once the transaction is sent
    sendPromise.then(
        function(transaction) {        
            // This promise will be resolve once the transaction has been mined.
            console.log("The transaction was sent: " + transaction.hash); 
        } 
    );

    sendPromise.catch(
        function(error) {
            console.log("An error happened!");
            console.log(error);
        }
    );

}