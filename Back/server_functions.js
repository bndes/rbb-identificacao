const config    = require('./config.json');
const keccak256 = require('keccak256'); 
const mongoose  = require('mongoose');           // mongoose for mongodb
const Promise   = require('bluebird');

module.exports = { uploadFileAndMakeTransaction, 
                   databaseInit        
                };

var Registry;

function validateHash(_cnpj, _accessTokenHash) {
    let registries = mongoose.model( 'Registry', config.infra.name_bd );

    // find all registries where cnpj = _cpnj, selecting the 'cnpj' and 'access_token' fields
    registries.find({ 'cnpj': _cnpj }, 'cnpj access_token', function (err, reg) {
      //if (err) return handleError(err);
      console.log(err);
    })
    
}

async function uploadFileAndMakeTransaction(_req, _res) {
    const cnpj          = _req.params.cnpj;
    const cpf           = _req.params.cpf;
    const accesstoken   = _req.params.accesstoken;
    const idtoken       = _req.params.idtoken;
    
    console.debug('/uploadFileAndMakeTransaction::cnpj = '        + cnpj);
    console.debug('/uploadFileAndMakeTransaction::cpf  = '        + cpf);
    console.debug('/uploadFileAndMakeTransaction::accesstoken = ' + accesstoken);
    console.debug('/uploadFileAndMakeTransaction::idtoken = '     + idtoken);
      
    
    let valid = await checkSignatureWithJWK(accesstoken, jwk);
    hashedAccessToken = await storeIDAccessToken(cnpj, cpf, accesstoken, idtoken, jwk);
    _res.json( { "hashedAccessToken" : hashedAccessToken, "signature valid" : valid } );
    _res.end();

}

async function storeIDAccessToken(_cnpj, _cpf, _accesstoken, _idtoken, _jwk) {

    const registry          = new Registry();
    registry.cnpj           = _cnpj;
    registry.cpf            = _cpf;
    registry.access_token   = _accesstoken;
    registry.id_token       = _idtoken;
    registry.jwk            = _jwk;
    registry.registrytime   = Date.now();

    registry.save()
    let hashedAccessToken = computeHash(_accesstoken);
    return hashedAccessToken;

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
        jwk: String,
        registrytime: Date
    });
}

