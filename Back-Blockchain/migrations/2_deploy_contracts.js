var RBBRegistry = artifacts.require("./RBBRegistry.sol");
var RBBLib = artifacts.require("./RBBLib.sol");

module.exports = async (deployer) => {
	await deployer.deploy(RBBLib);
	await deployer.link(RBBLib, RBBRegistry);
	await deployer.deploy(RBBRegistry, 33657248000189, {gas: 6721975})
	
};