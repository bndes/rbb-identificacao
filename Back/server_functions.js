const config    = require('./config.json');
const request   = require('request');
const jwt       = require('jsonwebtoken');
const keccak256 = require('keccak256'); 
const mongoose  = require('mongoose');                     // mongoose for mongodb
const Promise   = require('bluebird');
const ethers  = require('ethers');

module.exports = { prepareAssociacao, 
                   prepareLoginUnico, 
                   prepareAutorizacao, 
                   storeIDAccessToken, 
                   databaseInit, 
                   blockchainInit, 
                   checkIDStatus        
                };

var Registry;

var privateKey;
var wallet    ;
var valueInETH;
var gasLimit  ;
var provider  ;

function validateHash(_cnpj, _accessTokenHash) {
    let registries = mongoose.model( 'Registry', config.infra.name_bd );

    // find all registries where cnpj = _cpnj, selecting the 'cnpj' and 'access_token' fields
    registries.find({ 'cnpj': _cnpj }, 'cnpj access_token', function (err, reg) {
      //if (err) return handleError(err);
      console.log(err);
    })
    
}

async function checkIDStatus(_req, _res) {
    const id            = _req.params.id;
    
    console.debug('/checkIDStatus::id = ' + id);  

    // The Contract interface
    let abi = [
        "event AccountRegistration(address addr, uint id,  string idProofHash)",
        "event AccountChange(address oldAddr, address newAddr, uint id, string idProofHash)",
        "event AccountValidation(address addr, uint id)",
        "event AccountInvalidation(address addr, uint id)",
        "constructor (uint idResposibleForValidation) public",
        "function registryLegalEntity(uint cnpj, string idProofHash)",
        "function changeAccountLegalEntity(uint cnpj, address newAddr, string idProofHash)",
        "function validateRegistryLegalEntity(address addr) public",
        "function invalidateRegistryLegalEntity(address addr) public",
        "function setResponsibleForRegistryValidation(address rs) public onlyOwner",
        "function enableChangeAccount (address rs) public",
        "function isChangeAccountEnabled (address rs) public view returns (bool)",
        "function isResponsibleForRegistryValidation(address addr) public view returns (bool)",
        "function isOwner(address addr) public view returns (bool)",
        "function isAvailableAccount(address addr) public view returns (bool)",
        "function isWaitingValidationAccount(address addr) public view returns (bool)",
        "function isValidatedAccount(address addr) public view returns (bool)",
        "function isValidatedId(uint id) public view returns (bool)",
        "function isInvalidatedByValidatorAccount(address addr) public view returns (bool)",
        "function isInvalidatedByChangeAccount(address addr) public view returns (bool)",
        "function getResponsibleForRegistryValidation() public view returns (address)",
        "function getId (address addr) public view returns (uint)",
        "function getLegalEntityInfo (address addr) public view returns (uint, string memory, uint, address)",
        "function getBlockchainAccount(uint cnpj) public view returns (address)",
        "function getLegalEntityInfoById (uint cnpj) public view",
        "function getAccountState(address addr) public view returns (int)",
        "function registryMock(uint cnpj)"
    ];

// Connect to the network
//let provider = ethers.getDefaultProvider();

// The address from the above deployment example
let contractAddress = "0xeFDE680898e90cf837ef7D372021df4AAAecaE87";

// We connect to the Contract using a Provider, so we will only
// have read-only access to the Contract
let contract = new ethers.Contract(contractAddress, abi, provider);

let blockchainAccount = await contract.getBlockchainAccount (id);
let blockchainAccountStatus = await contract.getAccountState(blockchainAccount);

    _res.json( { "id"      : id,
                 "address" : blockchainAccount, 
                 "status"  : blockchainAccountStatus
               } );
    _res.end();
}

async function storeIDAccessToken(_req, _res) {
    const cnpj          = _req.params.cnpj;
    const cpf           = _req.params.cpf;
    const accesstoken   = _req.params.accesstoken;
    const idtoken       = _req.params.idtoken;
    
    console.debug('/storeIDAccessToken::cnpj = '        + cnpj);
    console.debug('/storeIDAccessToken::cpf  = '        + cpf);
    console.debug('/storeIDAccessToken::accesstoken = ' + accesstoken);
    console.debug('/storeIDAccessToken::idtoken = '     + idtoken);
        
    const registry          = new Registry();
    registry.cnpj           = cnpj;
    registry.cpf            = cpf;
    registry.access_token   = accesstoken;
    registry.id_token       = idtoken;
    registry.registrytime   = Date.now();

    await registry.save();

    let hashedAccessToken = computeHash(accesstoken);

    _res.json( { "hashedAccessToken" : hashedAccessToken } );
    _res.end();
}

function computeHash(input) {
	let hashedResult = keccak256(input).toString('hex');	
	return hashedResult;					
}

function databaseInit() {
    console.log("::databaseInit::");

    // Database Configuration
    var conn = mongoose.connect(config.infra.addr_bd + config.infra.name_bd );
    Promise.promisifyAll(mongoose); // key part - promisification

    //  Database Model 
    Registry = mongoose.model('Registry', {
        cnpj: Number,
        cpf: Number,
        access_token: String,
        id_token: String,
        registrytime: Date
    });
}

function blockchainInit() {
    console.log("::blockchainInit::");

    privateKey = "0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d"; //FIXME
    wallet     = new ethers.Wallet(privateKey);
    valueInETH = "0.001"; //FIXME
    gasLimit   = "53000"; //FIXME
    // provider   = ethers.getDefaultProvider('rinkeby'); 
    let url = "http://localhost:9545";   
    provider   = new ethers.providers.JsonRpcProvider(url);// Default: http://localhost:8545 //FIXME
}

function prepareAssociacao(_req, _res) {
    const address = _req.params.address;
    const id      = _req.params.id;
    console.debug('/prepareAssociacao::address = ' + address)
    console.debug('/prepareAssociacao:: id = ' + id)
    const isValidAddress = testParam(address);

    if (isValidAddress) {
        requestETH(address);
    } else {
        console.log("Can not send ETH to an invalid address!")
    }

    _res.send("The address: " + address + " | is valid? " + isValidAddress);
    _res.end();
}

function requestETH(_addressto) {
    //let provider = ethers.getDefaultProvider();

    var gasPricePromise = provider.getGasPrice();
    var balancePromise = provider.getBalance(wallet.address);
    var transactionCountPromise = provider.getTransactionCount(wallet.address);

    var allPromises = Promise.all([
        gasPricePromise,
        balancePromise,
        transactionCountPromise
    ]);

    var sendPromise = allPromises.then(
        function (results) {
            var gasPrice = results[0];
            var balance = results[1];
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
        function (transaction) {
            // This promise will be resolve once the transaction has been mined.
            console.log("The transaction was sent: " + transaction.hash);
        }
    );

    sendPromise.catch(
        function (error) {
            console.log("An error happened!");
            console.log(error);
        }
    );

}

function testParam(_param) {
    try {
        ethers.utils.getAddress(_param);
        return true;
    } catch (e) {
        return false;
    }
}

function prepareLoginUnico(_req, _res) {
    var response_type = "code";
    var redirect_uri = "https%3A%2F%2Ftoken-h.bndes.gov.br";
    var scope = "openid+email+phone+profile+govbr_empresa";
    var nonce = Math.round(Math.random() * 100000);
    console.log("nonce: " + nonce)
    //var state = "";

    var url = "https://sso.staging.acesso.gov.br/authorize?"
        + "response_type=" + response_type
        + "&client_id=" + config.acessogovbr.client_id
        + "&scope=" + scope
        + "&redirect_uri=" + redirect_uri
        + "&nonce=" + nonce
    //              + "&state="            + state 

    _res.redirect(url);
}

function prepareAutorizacao(_req, _res) {
    const code = _req.params.code;
    //const state = _req.params.state;
    console.log('/loginunico/autorizado/' + code)
    //console.log('/loginunico/autorizado/' + state )

    //_res.send("Response: " + code + " | " + state);    
    console.log("Code: " + code);

    var redirect_uri = "https%3A%2F%2Ftoken-h.bndes.gov.br";
    var url = "https://sso.staging.acesso.gov.br/token?" +
        "grant_type=authorization_code" +
        "&code=" + code +
        "&redirect_uri=" + redirect_uri;

    //acessar via POST o https://sso.staging.acesso.gov.br/token com o code

    console.log("URL : " + url);
    let data = config.acessogovbr.client_id + ":" + config.acessogovbr.client_secret;
    let buff = Buffer.from(data);
    let base64data = buff.toString('base64');

    console.log(data)
    console.log(base64data);
    console.log();

    request.post({
        headers:
        {
            'Authorization': 'Basic ' + base64data
        },
        url: url,
    }, function (error, response, body) {
        console.log(error);
        console.log();
        //console.log(response);
        //console.log();
        console.log(body);
        if (!error) {
            var jsonBody = JSON.parse(body);
            console.log("jsonBody: " + jsonBody)
            access_token = jsonBody.access_token;
            id_token = jsonBody.id_token
            token_type = jsonBody.token_type
            expires_in = jsonBody.expires_in

            processToClaimsId(id_token);
            console.log ("id_token");
            console.log(id_token);
            profileAccess(_res);
        }
        else {
            console.log("deu erro")
            _res.send(body);
            _res.end();
        }

    });
}

function processToClaimsId(token) {    

    // get the decoded payload ignoring signature, no secretOrPrivateKey needed
    var decoded = jwt.decode(token);
    
    // get the decoded payload and header
    var decoded = jwt.decode(token, {complete: true});
    console.log("************************************");
    console.log("decoded.header");
    console.log(decoded.header);
    console.log("------------------------------------");
    console.log("decoded.payload");
    console.log(decoded.payload);
    console.log("###############################");
    cpf = decoded.payload.sub;
    console.log( cpf );   

}

function profileAccess(_res) {
    
    console.log("profileAccess - cpf " + cpf);
    console.log("profileAccess - access_token " + access_token);

    var url = "https://api.staging.acesso.gov.br/empresas/v1/representantes/"+cpf+"/empresas?visao=simples";
              
    request.get({ headers:  
                { 
                    'Authorization' : 'Bearer ' + access_token
                }, 
                url: url, 
                }, function(error, response, body){
                    console.log(error);
                    console.log("keep going");
                    if (!error ) {
                        console.log(body);
                        body = body + "hash do token de autenticacao :  " + access_token;
                        _res.send(body);     
                        _res.end();  
                    }
                    else {
                        console.log("deu erro")
                        _res.send(body);    
                        _res.end();    
                    }
                })
                

}