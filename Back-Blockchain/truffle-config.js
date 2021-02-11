const HDWalletProvider = require("@truffle/hdwallet-provider");
const privateKey = "0x0000000000000000000000000000000000000000000000000000000000000000";
const writerIP = "127.0.0.1";
const writerPort = "4545";
const netID = "648629";
const privateKeyProvider = undefined;
//const privateKeyProvider = new HDWalletProvider(privateKey, "http://" + writerIP + ":" + writerPort); 

module.exports = {

  compilers: {
    solc: {
      version: "0.6"
    }    
  },
  
  networks: {
    development: {
      host: "localhost",
      port: 9545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      host: "vrt1281", // Connect to geth on the specified
      port: 9545,
      from: "0xd636349f5d7e03037e0f224c9b1ac3ccf104f4a5", // default address to use for any transaction Truffle makes during migrations
      network_id: 4,
      gas: 6952388  // Gas limit used for deploys
    },
    ropsten:  {
      host: "localhost",
      port:  8545,
      from: "0x5a2a2ba72133d6667a9abcc1bc882125904cb88a", // owner BNDESToken na Ropsten
      network_id: 3,
      gas:   4612388
    },
    meubesu:  {
      host: "localhost",
      port:  8545,
      from: "0xfe3b557e8fb62b89f4916b721be55ceb828dbd73", // owner BNDESToken na Besu
      network_id: 0x7e2,
      gas:   4612388
    }
    ,
    bid:  {
      host: writerIP,  
      port:  writerPort,
      provider: privateKeyProvider,
      network_id: netID,
      gasPrice: 0
    },     
    bndes:  {
      host: writerIP,  
      port:  writerPort,
      provider: privateKeyProvider,
      network_id: netID,
      gasPrice: 0
    }     
/**/
    
  }

};
