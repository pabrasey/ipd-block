var TaskList = artifacts.require("./TaskList.sol");
var PPCToken = artifacts.require("./PPCToken.sol");

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(PPCToken);
  let ppctoken = await PPCToken.deployed();
  await deployer.deploy(TaskList, ppctoken.address);
  let tasklist = await TaskList.deployed();
  await ppctoken.addMinter(tasklist.address); // add tasklist instance as PPCtoken minter
  const result = await tasklist.createTask('A new task', "description");
  await tasklist.addWorker(0, "0x8980612Ff293cB12527D56EF375db8CCd1fB7E61");
};
