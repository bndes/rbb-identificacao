const config    = require('./config.json');
const request   = require('request');
const jwt       = require('jsonwebtoken');
const keccak256 = require('keccak256'); 
const mongoose  = require('mongoose');                     // mongoose for mongodb
const Promise   = require('bluebird');

module.exports = { prepareAssociacao, prepareLoginUnico, prepareAutorizacao, storeIDAccessToken, databaseInit };

var conn;
var Registry;

async function storeIDAccessToken(_req, _res) {
    const id            = _req.params.id;
    const accesstoken   = _req.params.accesstoken;
    
    console.debug('/storeIDAccessToken::id = ' + id);
    console.debug('/storeIDAccessToken::accesstoken = ' + accesstoken);
        
    const registry = new Registry();
    registry.id = id;
    registry.id_type = 'CNPJ';
    registry.access_token = accesstoken;
    registry.registrytime = Date.now();

    await registry.save();

    let hashedAccessToken = computeHash(accesstoken);

    _res.send("Well done! Hashed accesstoken = " + hashedAccessToken);
    _res.end();
}

function computeHash(input) {
	let hashedResult = keccak256(input).toString('hex');	
	return hashedResult;					
}

function databaseInit() {
    console.log("::databaseInit::");

    // Database Configuration
    conn = mongoose.connect(config.infra.addr_bd);
    Promise.promisifyAll(mongoose); // key part - promisification

    //  Database Model 
    Registry = mongoose.model('Registry', {
        id: Number,
        id_type: String,
        access_token: String,
        registrytime: Date
    });
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
    var client_id = "token-h.bndes.gov.br";
    var redirect_uri = "https%3A%2F%2Ftoken-h.bndes.gov.br";
    var scope = "openid+email+phone+profile+govbr_empresa";
    var nonce = Math.round(Math.random() * 100000);
    console.log("nonce: " + nonce)
    //var state = "";

    var url = "https://sso.staging.acesso.gov.br/authorize?"
        + "response_type=" + response_type
        + "&client_id=" + client_id
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
    let data = config.infra.CLIENT_ID + ":" + config.infra.CLIENT_SECRET;
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