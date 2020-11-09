const config        = require('./config.json');
const keccak256     = require('keccak256'); 
const axios         = require('axios').default;
const FormData      = require('form-data')
const fs            = require('fs');
const mock_vra      = require('./mock_vra.json');
const https      	= require ('https');

module.exports = {  uploadFileAndMakeTransaction,  
                    validateDocumentSignature,
                    preencheDeclaracao,
                    buscaDadosCNPJ
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

async function preencheDeclaracao(cnpj, address, pj, modelo, mockPJ) {
    console.log("preenche declaracao");
    console.log("preencheDeclaracao::cnpj = ");
    console.log(cnpj);
    
    const arquivoModelo = require ('./arquivos/modelo_declaracao/MODELO_CADASTRO.json'); //TODO: colocar no config

    var stringified = JSON.stringify(arquivoModelo);
    stringified = stringified.replace('##CNPJ##', cnpj );
    stringified = stringified.replace('##ADDRESS##', address );
    stringified = stringified.replace('##RAZAOSOCIAL##', "lalala" );
    
    console.log('pj.dadosCadastrais')
    console.log(pj.dadosCadastrais)    

    console.log(stringified);
    const caminho = './arquivos/tmp/stringified.json';
    fs.writeFileSync(caminho, stringified);

    return caminho;
}

async function buscaDadosCNPJ (cnpj, mockPJ) {
    //console.log('buscaDadosCNPJ::mockPJ=' + mockPJ);
    let cnpjRecebido = cnpj;
let retorno;
    let isNum = /^\d+$/.test(cnpjRecebido);

    if (!isNum) {	
        //console.log("!isNum");
        retorno = {};
        return retorno;
    }


    if (mockPJ) {
        //console.log("mock PJ ON!");

        if ( cnpjRecebido == undefined || cnpjRecebido == '00000undefined' || cnpjRecebido == '00000000000000')	{
            //console.log("cnpj com problema");
            retorno = {};
            return;
        }
        
        https.get('https://www.receitaws.com.br/v1/cnpj/' + cnpjRecebido, (resp)  => {
            let data = '';

            resp.on('data', (chunk) => {
                data += chunk;
            });

            resp.on('end', async () => {
                if (data == "Too many requests, please try again later.") {

                    //console.log(data);
                    let pj = {
                        cnpj: "00000000000000",
                        dadosCadastrais: {
                            razaoSocial: "Serviço da Receita Indisponível"
                        }
                    };
                    retorno = pj;
                    return pj;
                }
                else {
                    console.log("else");

                    try {
                        jsonData = JSON.parse(data);
                    } catch (e) {
                        console.log("catch");
                        retorno = pj;
                        return pj;
                    }
                    //console.log(jsonData);

                    let pj = {
                        cnpj: cnpjRecebido,
                        dadosCadastrais: {
                            razaoSocial: jsonData.nome
                        }
                    };
                    console.log("pj=");
                    console.log(pj);
                    retorno = pj;
                    return pj;
                }

            });
        }).on("error", (err) => {
            console.log("Erro ao buscar mock da API: " + err.message);
        });

    }
    else {

        new sql.ConnectionPool(configAcessoBDPJ).connect().then(pool => {
            return pool.request()
                                 .input('cnpj', sql.VarChar(14), cnpjRecebido)
                                 .query(config.negocio.query_cnpj)
            
            }).then(result => {
                let rows = result.recordset

                if (!rows[0]) {
                    retorno = {};
                    return retorno;
                }

                let pj = 	
                {
                    cnpj: rows[0]["CNPJ_EMPRESA"],
                    dadosCadastrais: {
                        razaoSocial: rows[0]["NOME_EMPRESARIAL"]
                    }
                }

                console.log("pj do QSA");				
                console.log(pj);

                sql.close();
                retorno = pj;
                return pj;
                


            }).catch(err => {
                console.log(err);
                retorno = { message: "${err}"};
                sql.close();
                return retorno;
            });


    }

     {
        console.log('retorno');
        console.log(retorno);
    }
}	

function validateDocumentSignature(fileReadStream, cnpjEsperado, mock) {
    console.log("validateDocumentSignature");

    if ( mock ) {
        let grauConformidade         = mock_vra.grauConformidade;
        let certificadoVigente       = mock_vra.informacaoAssinaturas[0].estaVigente;
        let cnpjCertificado          = mock_vra.informacaoAssinaturas[0].informacoesCertificadoIcpBrasil.informacoesCertificado.cnpj;
        return declaracaoEstaValida(grauConformidade, certificadoVigente, cnpjCertificado, cnpjEsperado );
    } else {
        //fileReadStream = fs.createReadStream('teste.pdf');//cnpjEsperado="31986741000117"
        return processaDeclaracao(fileReadStream, cnpjEsperado);
    }
    
}

function processaDeclaracao(declaracaoReadStream, cnpjEsperado) {
    const URLVRA = "http://web.dsv.bndes.net/vra/rest/validar-assinatura?verificacaoSimplificada=true";
    const form = new FormData();
    //form.append('my_field', 'my value');
    //form.append('my_buffer', new Buffer(10));
    form.append('', declaracaoReadStream );
    
    axios.post(URLVRA, form, { headers: form.getHeaders() })
    .then(function (response) {
        let grauConformidade    = response.data.grauConformidade;
        let certificadoVigente  = response.data.informacaoAssinaturas[0].estaVigente;
        let informacoesCertificado = response.data.informacaoAssinaturas[0].informacoesCertificadoIcpBrasil.informacoesCertificado;
        let cnpj = informacoesCertificado.cnpj;
        let cpf  = informacoesCertificado.cpfresponsavel;

        return declaracaoEstaValida(grauConformidade, certificadoVigente, cnpj, cnpjEsperado );
        
        // if ( situacaoDeclaracao == 0) {
        //     console.log("Declaração OK! (" + situacaoDeclaracao + ")");
        // } else {
        //     console.log("Declaração com problema! (" + situacaoDeclaracao + ")");
        // }

        // console.log(grauConformidade);
        // console.log(certificadoVigente);
        // console.log(cnpj);
        // console.log(cpf);

        // console.log(response.status);
        // console.log(response.statusText);
        // console.log(response.headers);
        // console.log(response.config);
    });
}

function declaracaoEstaValida(grauConformidade, certificadoVigente, cnpjCertificado, cnpjEsperado ) {
    if ( grauConformidade != "Alta") {
        console.log("grauConformidade != 'Alta' => grauConformidade = " + grauConformidade);
        return -1;
    }
    if ( certificadoVigente == false) {
        console.log("certificadoVigente == false" );
        return -2;
    }
    if ( cnpjCertificado != cnpjEsperado ) {
        console.log("cnpjCertificado != cnpjEsperado" + cnpjCertificado + " != " + cnpjEsperado );
        return -3;
    }
    return 0; //OK
}


function signDocument() {
    //TODO: verify whether this functionality is available through a REST API
    //https://gitlab.bndes.net/sist-smd/smd_spa/blob/develop/smd-back/src/main/java/br/gov/bndes/smd/feature/tramite/laudopericial/LaudoPericialServico.java 
    //  private File assinarDocumentoFinal(DocumentoTramite documentoTramite, long paginaInclusaoAssinaturaVisual, File arquivo, boolean apagarArquivoOrigem)10:39:17
}
