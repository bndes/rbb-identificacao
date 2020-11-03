const config    = require('./config.json');
const keccak256 = require('keccak256'); 


module.exports = {  uploadFileAndMakeTransaction,  
                    uploadFileAndMakeTransaction
                };


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
