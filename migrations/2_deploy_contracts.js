var TaskList = artifacts.require("./TaskList.sol");
var PPCToken = artifacts.require("./PPCToken.sol");
var AddressBook = artifacts.require("./AddressBook.sol");
var Rewards = artifacts.require("./Rewards.sol");

module.exports = async function(deployer, network, accounts) {

  // deploy PPCToken
  await deployer.deploy(PPCToken);
  let ppctoken = await PPCToken.deployed();

  // deploy TaskList
  await deployer.deploy(TaskList, ppctoken.address);
  let tasklist = await TaskList.deployed();
  await ppctoken.addMinter(tasklist.address); // add tasklist instance as PPCtoken minter

  // deploy AddressBook
  await deployer.deploy(AddressBook, "validator 1");
  let addressbook = await AddressBook.deployed();
  await addressbook.addParticipant(accounts[1], "validator 2", {from: accounts[0]});
  await addressbook.addParticipant(accounts[2], "worker 1", {from: accounts[0]});
  await addressbook.addParticipant(accounts[3], "worker 2", {from: accounts[0]});

  // deploy Rewards
  await deployer.deploy(Rewards, ppctoken.address, addressbook.address);

  // create a task examples
  const validator_1 = accounts[0];
  const validator_2 = accounts[1];
  const worker_1 = accounts[2];
  const worker_hours_1 = 4;
  const worker_hours_2 = 3;
  const worker_2 = accounts[3];

  // created task
  const task_id_0 = 0;
  await tasklist.createTask('First task', "This is an example task in state CREATED");
  await tasklist.addValidator(task_id_0, validator_2, {from: validator_1});
  await tasklist.addWorker(task_id_0, worker_1);

  // accepted task
  const task_id_1 = 1;
  await tasklist.createTask('Second task', "This is an example task in state ACCEPTED");
  await tasklist.addValidator(task_id_1, validator_2, {from: validator_1});
  await tasklist.addWorker(task_id_1, worker_1);
  await tasklist.addWorker(task_id_1, worker_2);
  await tasklist.acceptTask(task_id_1, {from: worker_1})
  await tasklist.acceptTask(task_id_1, {from: worker_2})
  await tasklist.addWorkedHours(task_id_1, worker_hours_1, {from: worker_1});

  // completed task
  const task_id_2 = 2;
  await tasklist.createTask('Third task', "This is an example task in state COMPLETED");
  await tasklist.addValidator(task_id_2, validator_2, {from: validator_1});
  await tasklist.addWorker(task_id_2, worker_1);
  await tasklist.acceptTask(task_id_2, {from: worker_1})
  await tasklist.addWorkedHours(task_id_2, worker_hours_1, {from: worker_1});
  await tasklist.completeTask(task_id_2, 100, {from: worker_1});
  amount = web3.utils.toWei('10', "ether");
  await tasklist.fundTask(task_id_2, {from: validator_1, value: amount, gasPrice:0});
  await tasklist.validateTask(task_id_2, 100, 5, {from: validator_2});

  // validated task
  const task_id_3 = 3;
  await tasklist.createTask('Fourth task', "This is an example task in state VALIDATED");
  await tasklist.addValidator(task_id_3, validator_2, {from: validator_1});
  await tasklist.addWorker(task_id_3, worker_1);
  await tasklist.acceptTask(task_id_3, {from: worker_1})
  await tasklist.addWorkedHours(task_id_3, worker_hours_1, {from: worker_1});
  await tasklist.completeTask(task_id_3, 100, {from: worker_1});
  amount = web3.utils.toWei('10', "ether");
  await tasklist.fundTask(task_id_3, {from: validator_1, value: amount, gasPrice:0});
  await tasklist.validateTask(task_id_3, 100, 10, {from: validator_1});
  await tasklist.validateTask(task_id_3, 100, 5, {from: validator_2});
};
