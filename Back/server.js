// Set up
const express 			= require('express');
const app 				= express();                               
const bodyParser 		= require('body-parser');    // pull information from HTML POST (express4)
const methodOverride 	= require('method-override'); // simulate DELETE and PUT (express4)
const cors 				= require('cors');
const Promise 			= require('bluebird');
const config 			= require('./config.json');
const sql		 		= require("mssql");
const fs 				= require('fs');
const keccak256 		= require('keccak256'); 
const https 			= require ('https');
const multer 			= require('multer');

const request 			= require('request');

const SERVER_FUNCTIONS     = require('./server_functions.js');

const DIR_UPLOAD = config.infra.caminhoArquivos + config.infra.caminhoUpload;
const DIR_CAMINHO_DECLARACAO = config.infra.caminhoArquivos + config.infra.caminhoDeclaracao;
const DIR_CAMINHO_COMPROVANTE_DOACAO = config.infra.caminhoArquivos + config.infra.caminhoComprovanteDoacao;
const DIR_CAMINHO_COMPROVANTE_LIQUIDACAO = config.infra.caminhoArquivos + config.infra.caminhoComprovanteLiquidacao;

const CAMINHO_MODELO_DECLARACAO_CONTA_DIGITAL = config.infra.caminhoModeloDeclaracaoContaBlockchain;
const CAMINHO_ROTEIRO_ASSINATURA_DIGITAL = config.infra.caminhoRoteiroAssinaturaDigital;

const MAX_FILE_SIZE = Number( config.negocio.maxFileSize );

const mockPJ 			= config.negocio.mockPJ;
const mockValidacaoCert = config.negocio.mockValidacaoCert;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR_UPLOAD);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(' ').join('-');
    cb(null, fileName)
  }
});

const uploadMiddleware = multer(
								{ 
									limits: {fileSize: MAX_FILE_SIZE},								
									storage: storage,
									fileFilter: (req, file, cb) => {
										if (file.mimetype == "application/pdf") {
											cb(null, true);
										} else {
											cb(null, false);
											return cb(new Error('Only .pdf format allowed!'));
										}
									}
								}
							   ).single('arquivo');

// Configuration
//mongoose.connect(config.infra.addr_bd);

app.use(bodyParser.urlencoded({ 'extended': 'true' }));         // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());
app.use(cors());

//SERVER_FUNCTIONS.databaseInit();

app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

	next();
});

//console.log(config.infra.caminhoPastaPublica);

//https://expressjs.com/pt-br/starter/static-files.html
app.use(express.static(config.infra.caminhoPastaPublica));


//Promise.promisifyAll(mongoose); // key part - promisification


/*var PessoasJuridicas = mongoose.model('Pessoasjuridicas', {

	cnpj: String,
	dadosCadastrais: {
		cidade: String,
		razaoSocial: String,
	},
	subcreditos: [{
		numero: Number,
	}],
});
*/

// Rotas
/*
	//use para pegar qq verbo hhtp
	//verifica autenticacao para todas as rotas abaixo
	app.use('/*', function(req, res, next) {
		console.log("Sempre passa por aqui");
		next();
    });
*/

//Configuracao de acesso ao BD
let configAcessoBDPJ = config.infra.acesso_BD_PJ;
configAcessoBDPJ.password = process.env.BNC_BD_PJ_PASSWORD;



//var contrato_json_BNDESToken = require(config.infra.contrato_json_BNDESToken);
var contrato_json_BNDESRegistry = require(config.infra.contrato_json_BNDESRegistry);

var n = contrato_json_BNDESRegistry.networks;

console.log("config.infra.rede_blockchain (1=Main|4=Rinkeby|4447=local) = " + config.infra.rede_blockchain);

//ABI = contrato_json_BNDESToken['abi']

//let addrContratoBNDESToken;
let addrContratoBNDESRegistry;
if (config.infra.rede_blockchain < 10) {  
	console.log ("config.infra.rede_blockchain=" + config.infra.rede_blockchain);
	//addrContratoBNDESToken = config.infra.endereco_BNDESToken;
	addrContratoBNDESRegistry = config.infra.endereco_BNDESRegistry;
}
else { //TODO: testar localhost
	
	try {
		console.log ("config.infra.rede_blockchain>10 -> rede local=" + config.infra.rede_blockchain);
		let test = n[config.infra.rede_blockchain].address 
	} catch (error) {
		console.log ("ERROR. Consider: ")
		console.log ("1) remove the back-blockchain/build and then migrate again...")
		console.log ("2) the number of the network in your config.json")
		console.log ("	networks = " + n)
		console.log ("	config.infra.rede_blockchain = " + config.infra.rede_blockchain)
		console.log ("	networks[config.infra.rede_blockchain] = " + n[config.infra.rede_blockchain])		
		process.exit();
	}
	//addrContratoBNDESToken = n[config.infra.rede_blockchain].address;
	addrContratoBNDESRegistry = contrato_json_BNDESRegistry.networks[config.infra.rede_blockchain].address;
}

//console.log("endereco do contrato BNDESToken=" + addrContratoBNDESToken);
console.log("endereco do contrato BNDESRegistry=" + addrContratoBNDESRegistry);


app.get('/api/abi', function (req, res) {
	res.json(contratoJson);
})

app.get('/api/hash/:filename', async function (req, res) {
	const filename = req.params.filename;		
	const hashedResult = await SERVER_FUNCTIONS.calculaHash(config.infra.caminhoUpload + filename);
	return res.json(hashedResult);
})

//recupera constantes front
app.post('/api/constantesFront', function (req, res) {
	res.json({ 
		//addrContratoBNDESToken: addrContratoBNDESToken, 
		addrContratoBNDESRegistry: addrContratoBNDESRegistry,
		blockchainNetwork: config.infra.rede_blockchain,
		//abiBNDESToken: contrato_json_BNDESToken['abi'],
		abiBNDESRegistry: contrato_json_BNDESRegistry['abi']
	 });
});

console.log("operationAPIURL=" + config.infra.operationAPIURL);
console.log("mockValidacaoCert=" + mockValidacaoCert);

app.post('/api/constantesFrontPJ', function (req, res) {
	console.log("operationAPIURL=" + config.infra.operationAPIURL);
	console.log("mockMongoClient=" + config.negocio.mockMongoClient);
	
	console.log("mockPJ=" + mockPJ)

	let consts = { operationAPIURL: config.infra.operationAPIURL,  
		mockMongoClient: config.negocio.mockMongoClient, 
		mockPJ: mockPJ,
		maxFileSize: MAX_FILE_SIZE,
		CAMINHO_MODELO_DECLARACAO_CONTA_DIGITAL: CAMINHO_MODELO_DECLARACAO_CONTA_DIGITAL,
		CAMINHO_ROTEIRO_ASSINATURA_DIGITAL: CAMINHO_ROTEIRO_ASSINATURA_DIGITAL		
	}

	res.json(consts);

	console.log(consts);

});


app.post('/api/pj-por-cnpj', buscaPJPorCnpj);
console.log('/api/pj-por-cnpj::mockPJ=' + mockPJ);
	function buscaPJPorCnpj (req, res, next) {
		console.log('buscaPJPorCnpj::mockPJ=' + mockPJ);
		let cnpjRecebido = req.body.cnpj;

		let isNum = /^\d+$/.test(cnpjRecebido);

		if (!isNum) {			
			res.status(200).json({});
		}


		if (mockPJ) {
			console.log("mock PJ ON!");

			if ( cnpjRecebido == undefined || cnpjRecebido == '00000undefined' || cnpjRecebido == '00000000000000')	
				return;

			https.get('https://www.receitaws.com.br/v1/cnpj/' + cnpjRecebido, (resp) => {
				let data = '';

				resp.on('data', (chunk) => {
					data += chunk;
				  });

				resp.on('end', () => {
					if (data=="Too many requests, please try again later.") {

						console.log(data)
						let pj = 	
						{
							cnpj: "00000000000000",
							dadosCadastrais: {
								razaoSocial: "Serviço da Receita Indisponível"
							}
						}
						res.status(200).json(pj);
						return;
					} 
					else {
						try {
							jsonData = JSON.parse(data);
						} catch (e) {
							res.status(200).json(pj);
							return;	
						}						
						console.log(jsonData);

						let pj = 	
						{
							cnpj: cnpjRecebido,
							dadosCadastrais: {
								razaoSocial: jsonData.nome
							}
						}
						console.log("pj=");
						console.log(pj);
						res.status(200).json(pj);			
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
						res.status(200).json({});
						return;
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
	
					res.status(200).json(pj);				
					sql.close();
	
	
				}).catch(err => {
					console.log(err);
					res.status(500).send({ message: "${err}"})
					sql.close();
				});
	

		}


	}	

app.get('/api/preenchedoc/:cnpj/:address', preencheDoc);

async function preencheDoc(req, res, next) {
	console.log("preencheDoc")

	let cnpj = req.params.cnpj.toString().replace(" ","");
	let address = req.params.address.toString().replace(" ","");
	
	
	//buscaPJPorCnpj(cnpj); //TODO : adaptar a funcao de busca para retornar os dados e preencher na funcao abaixo.
	await SERVER_FUNCTIONS.buscaDadosCNPJ(cnpj, address, CAMINHO_MODELO_DECLARACAO_CONTA_DIGITAL, mockPJ, res);
	//console.log("resultado pj: " + pj )
		
	//let retornoDeclaracao 	= await SERVER_FUNCTIONS.preencheDeclaracao(cnpj, address, pj, CAMINHO_MODELO_DECLARACAO_CONTA_DIGITAL, mockPJ);
	//console.log('retornoDeclaracao');
	//console.log(retornoDeclaracao);
	//res.download(retornoDeclaracao);
	
	
}


//upload.single('arquivo')
app.post('/api/upload', trataUpload);

function trataUpload(req, res, next) {

	console.log("trataUpload - uploadMiddleware ")
	console.log(uploadMiddleware);
	
  	//calls the uploadMiddleware function to process the upload
	uploadMiddleware(req, res, async function (err) {
			if (err) {
				// An error occurred when uploading
				console.log(err);
				return res.status(422).send("Um erro ocorreu. Somente são aceitos arquivos do tipo PDF.")
			}  
			else {
				// No error occured.			
				let cnpj     = req.body.cnpj;
				let contrato = req.body.contrato;	
				let conta    = req.body.contaBlockchain;
				let tipo     = req.body.tipo;

				console.log("tipo=");
				console.log(tipo);	

				const tmp_path = req.file.path;
				const hashedResult = await SERVER_FUNCTIONS.calculaHash(tmp_path);			
				
				let target_path = "";

				if (tipo=="declaracao") {					
					let fileName = SERVER_FUNCTIONS.montaNomeArquivoDeclaracao(cnpj, contrato, conta, hashedResult);
					target_path = DIR_CAMINHO_DECLARACAO + fileName;
				}
				else if (tipo=="comp_doacao") {
					let fileName = SERVER_FUNCTIONS.montaNomeArquivoComprovanteDoacao(cnpj, hashedResult);
					target_path = DIR_CAMINHO_COMPROVANTE_DOACAO + fileName;
				}
				else if (tipo=="comp_liq") {
					let fileName = SERVER_FUNCTIONS.montaNomeArquivoComprovanteLiquidacao(cnpj, contrato, hashedResult);
					target_path = DIR_CAMINHO_COMPROVANTE_LIQUIDACAO + fileName;
				}		
				else {
					throw "erro tipo desconhecido para download de arquivo";
				}
								
				// A better way to copy the uploaded file. 
				const src  = fs.createReadStream(tmp_path);
				const cnpjEsperado = cnpj;
				
				let retornoValidacaoCert = SERVER_FUNCTIONS.validateDocumentSignature(src, cnpjEsperado, mockValidacaoCert);
				if ( retornoValidacaoCert == 0 ) {
					const dest = fs.createWriteStream(target_path);
					src.pipe(dest);
					src.on('end', function ()
					{
						console.log("Upload Completed from "+ tmp_path + ", original name " + req.file.originalname + ", copied to " + target_path); 
					});
					src.on('error', function (err)
					{
						console.log("Upload ERROR! from "+ tmp_path + ", original name " + req.file.originalname + ", copied to " + target_path); 
					});	
					res.json(hashedResult);
				} else {
					let msg = " Certificado não está OK! Erro: " + retornoValidacaoCert;
					console.log(msg); 
					res.json(msg);
				}

				
			}
		}
	);
}



app.post('/api/fileinfo', buscaFileInfo);

async function buscaFileInfo(req, res) {
	
	try {

		let cnpj     		  = req.body.cnpj;
		let contrato 		  = req.body.contrato;
		let blockchainAccount = req.body.blockchainAccount.toLowerCase();
		let tipo     		  = req.body.tipo;
		let hashFile 		  = req.body.hashFile;		

		let filePathAndNameToFront = await SERVER_FUNCTIONS.buscaTipoArquivo(cnpj, contrato, blockchainAccount, tipo, hashFile);

		let respJson = {
			pathAndName: filePathAndNameToFront
		};
	
		console.log(respJson);
		res.json(respJson);

	}
	catch (err) {
		console.log("Erro buscar informações do arquivo.");
		console.log(err)
		res.sendStatus(500);
		return;
	}

}

// listen (start app with node server.js) ======================================
app.listen(8080, "0.0.0.0");

let data = "\n" + new Date() + "\nApp listening on port 8080 ";
console.log(data);
