const express           = require('express');
const app               = express();
const port              = 3000; //FIXME

var serverFunctions     = require('./server_functions.js');

serverFunctions.databaseInit();
serverFunctions.blockchainInit();

app.get('/checkIDStatus/:id', serverFunctions.checkIDStatus );
app.get('/prepareToStoreAssociation/:cnpj/:cpf/:accesstoken/:idtoken', serverFunctions.prepareToStoreAssociation );

app.get('/prepareAssociacao/:address/:id', serverFunctions.prepareAssociacao );
app.get('/loginunico', serverFunctions.prepareLoginUnico);
app.get('/loginunico/autorizado/:code', serverFunctions.prepareAutorizacao);

app.listen(port, () => console.log('App listening on port ' + port + '!'))