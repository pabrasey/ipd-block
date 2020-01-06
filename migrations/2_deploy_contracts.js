var TaskList = artifacts.require("./TaskList.sol");
var PPCToken = artifacts.require("./PPCToken.sol");

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(PPCToken);
  let ppctoken = await PPCToken.deployed();
  await deployer.deploy(TaskList, ppctoken.address);
  let tasklist = await TaskList.deployed();
  await ppctoken.addMinter(tasklist.address); // add tasklist instance as PPCtoken minter

  // create a task examples
  const validator_1 = accounts[0];
  const validator_2 = accounts[1];
  const worker_1 = accounts[2];
  const worker_hours_1 = 4;
  const worker_hours_2 = 3;
  const worker_2 = accounts[3];

  const task_id_0 = 0;
  await tasklist.createTask('A new task', "This is example task in state ACCEPTED");
  await tasklist.addValidator(task_id_0, validator_2, {from: validator_1});
  await tasklist.addWorker(task_id_0, worker_1);
  await tasklist.addWorkedHours(task_id_0, worker_hours_1, {from: worker_1});

  const task_id_1 = 1;
  await tasklist.createTask('A new task', "This is an example task in state COMPLETED");
  await tasklist.addValidator(task_id_1, validator_2, {from: validator_1});
  await tasklist.addWorker(task_id_1, worker_1);
  await tasklist.addWorkedHours(task_id_1, worker_hours_1, {from: worker_1});
  await tasklist.completeTask(task_id_1, 100, {from: worker_1});
  amount = web3.utils.toWei('10', "ether");
  await tasklist.fundTask(task_id_1, {from: validator_1, value: amount, gasPrice:0});
  await tasklist.validateTask(task_id_1, 100, 5, {from: validator_2});

  const task_id_2 = 2;
  await tasklist.createTask('A new task', "This is an example task in state VALIDATED");
  await tasklist.addValidator(task_id_2, validator_2, {from: validator_1});
  await tasklist.addWorker(task_id_2, worker_1);
  await tasklist.addWorkedHours(task_id_2, worker_hours_1, {from: worker_1});
  await tasklist.completeTask(task_id_2, 100, {from: worker_1});
  amount = web3.utils.toWei('10', "ether");
  await tasklist.fundTask(task_id_2, {from: validator_1, value: amount, gasPrice:0});
  await tasklist.validateTask(task_id_2, 100, 10, {from: validator_1});
  await tasklist.validateTask(task_id_2, 100, 5, {from: validator_2});
};
