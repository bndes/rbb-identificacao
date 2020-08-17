const ethers  = require('ethers');
const express = require('express');

const app     = express();
const port    = 3000; //FIXME

const privateKey = "0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d"; //FIXME
const wallet     = new ethers.Wallet(privateKey);
const valueInETH = "0.001"; //FIXME
const gasLimit   = "53000"; //FIXME
//const provider   = ethers.getDefaultProvider('rinkeby'); 
let url = "http://localhost:9545";   
const provider   = new ethers.providers.JsonRpcProvider(url);// Default: http://localhost:8545 //FIXME

var access_token ;
var id_token     ;
var token_type   ;
var expires_in   ;

var cpf;

var serverFunctions    = require('./server_functions.js');

serverFunctions.databaseInit();

app.get('/storeIDAccessToken/:id/:accesstoken', serverFunctions.storeIDAccessToken );

app.get('/prepareAssociacao/:address/:id', serverFunctions.prepareAssociacao );
app.get('/loginunico', serverFunctions.prepareLoginUnico);
app.get('/loginunico/autorizado/:code', serverFunctions.prepareAutorizacao);

app.listen(port, () => console.log('App listening on port ' + port + '!'))