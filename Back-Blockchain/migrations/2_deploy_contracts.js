var RBBRegistry = artifacts.require("./RBBRegistry.sol");
var RBBLib = artifacts.require("./RBBLib.sol");

module.exports = async (deployer) => {
	await deployer.deploy(RBBLib);
	await deployer.link(RBBLib, RBBRegistry);
	await deployer.deploy(RBBRegistry, 33657248000189, "9c46ae9957f4589d4a4c50ff4eaf01a2516f755e20102ab59403c484e086f647", {gas: 6721975})
	//TODO: change the 9c46ae9957f4589d4a4c50ff4eaf01a2516f755e20102ab59403c484e086f647 to the hash of BNDES auto-declaration of address property and liability
};