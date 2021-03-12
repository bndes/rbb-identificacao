var RBBRegistry = artifacts.require("./RBBRegistry.sol");
var RBBLib = artifacts.require("./RBBLib.sol");

var RBBRegistry_v2 = artifacts.require("./RBBRegistry_v2.sol");

module.exports = async (deployer) => {
	await deployer.deploy(RBBLib);
	await deployer.link(RBBLib, RBBRegistry);
	
	let CNPJ = 33657248000189;
	let hash = "9c46ae9957f4589d4a4c50ff4eaf01a2516f755e20102ab59403c484e086f647"; //TODO: change the 9c46ae9957f4589d4a4c50ff4eaf01a2516f755e20102ab59403c484e086f647 to the hash of BNDES auto-declaration of address property and liability
	let daysToExpire = 3650;
	await deployer.deploy(RBBRegistry, CNPJ, hash , daysToExpire, {gas: 6721975})
	await deployer.deploy(RBBRegistry_v2, {gas:  804247552})
	
};