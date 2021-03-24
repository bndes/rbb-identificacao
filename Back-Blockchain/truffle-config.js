const privateKey = "0x0000000000000000000000000000000000000000000000000000000000000000";
const writerIP = "user:senha@rbb.hom.bndes.net/node";
const writerPort = "443";
const netID = "648629";
let privateKeyProvider;

if ( false ) {
  const HDWalletProvider = require("@truffle/hdwallet-provider");
  privateKeyProvider = new HDWalletProvider(privateKey, "https://" + writerIP ); 
}

module.exports = {

  compilers: {
    solc: {
      version: "0.6"
    }    
  },
  
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      host: "vrt1281", // Connect to geth on the specified
      port: 8545,
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
