const ethers  = require('ethers');

//const abiAsJson = require ('../Back-Blockchain/build/contracts/RBBRegistry_v2.json').abi;

const abiAsJson = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "int256",
				"name": "count",
				"type": "int256"
			}
		],
		"name": "Decrement",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "decrementCounter",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "int256",
				"name": "count",
				"type": "int256"
			}
		],
		"name": "Increment",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "incrementCounter",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getCount",
		"outputs": [
			{
				"internalType": "int256",
				"name": "",
				"type": "int256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

const abi = JSON.stringify(abiAsJson);

//const provider  = new ethers.providers.JsonRpcProvider("http://35.239.231.134:4545/");
const provider  = new ethers.providers.WebSocketProvider("ws://35.239.231.134:4546");

const contractAddr = "0x112D9D4cfA63ff0E8EeF76cbe1B2f21f7A479092"; 

const contract = new ethers.Contract(contractAddr, abi, provider);

contract.on("*", (event) => {
    console.log("event: ", event);
    console.log("counter: ", event.args.count);
});




//on comeca a contar quando o objeto do contrato foi criado ou quando o inicia o on? 

//  console.log(contract);

