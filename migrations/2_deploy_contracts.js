var TaskList = artifacts.require("./TaskList.sol");
var PPCToken = artifacts.require("./PPCToken.sol");

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(PPCToken);
  let ppctoken = await PPCToken.deployed();
  await deployer.deploy(TaskList, ppctoken.address);
  let tasklist = await TaskList.deployed();
  await ppctoken.addMinter(tasklist.address); // add tasklist instance as PPCtoken minter
};
