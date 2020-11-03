const config    = require('./config.json');
const keccak256 = require('keccak256'); 
const mongoose  = require('mongoose');           // mongoose for mongodb
const Promise   = require('bluebird');

module.exports = {  uploadFileAndMakeTransaction,  
                    uploadFileAndMakeTransaction
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

function validateDocumentSignature() {
    let URL = "http://web.dsv.bndes.net/vra/rest/validar-assinatura?verificacaoSimplificada=true";
    //TODO: implement this method
}

function signDocument() {
    //TODO: verify whether this functionality is available through a REST API
    //https://gitlab.bndes.net/sist-smd/smd_spa/blob/develop/smd-back/src/main/java/br/gov/bndes/smd/feature/tramite/laudopericial/LaudoPericialServico.java 
    //  private File assinarDocumentoFinal(DocumentoTramite documentoTramite, long paginaInclusaoAssinaturaVisual, File arquivo, boolean apagarArquivoOrigem)10:39:17
}
