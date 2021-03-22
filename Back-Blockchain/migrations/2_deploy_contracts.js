
var RBBRegistry = artifacts.require("./RBBRegistry.sol");

module.exports = async (deployer) => {
	await deployer.deploy(RBBRegistry, {gas:  804247552})
	
};