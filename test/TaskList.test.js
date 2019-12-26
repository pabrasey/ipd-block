// @ts-nocheck
const PPCToken = artifacts.require('./PPCToken.sol')
const TaskList = artifacts.require('./TaskList.sol')

const truffleAssert = require('truffle-assertions');

contract('TaskList Tests', (accounts) => {

  const validator_0 = accounts[0];
  const validator_1 = accounts[1];
  const worker_1 = accounts[2];
  const worker_2 = accounts[3];

  before(async () => {
    this.ppctoken = await PPCToken.deployed()
    this.tasklist = await TaskList.deployed()
  })

  it('deploys successfully', async () => {
    const address = await this.tasklist.address
    assert.notEqual(address, 0x0)
    assert.notEqual(address, '')
    assert.notEqual(address, null)
    assert.notEqual(address, undefined)
  })

  it('creates tasks', async () => {
    const result = await this.tasklist.createTask('A new task', "description");
    const task = await this.tasklist.tasks(0);
    assert.equal(task.title, 'A new task');

    const task_count = await this.tasklist.task_count();
    assert.equal(task_count.toNumber(), 1);

    let validators = await this.tasklist.getValidators(0);
    assert.equal(validators[0], accounts[0]);

    // check the event
    const event = result.logs[0].args
    assert.equal(event.id.toNumber(), 0)
    assert.equal(event.title, 'A new task')
    assert.equal(event.state.toNumber(), 0)
    assert.equal(event.validators[0], accounts[0])
  });

  it('adds validator from the allowed accounts', async () => {
    // validator adds new validator
    let result_1 = await this.tasklist.addValidator(0, validator_1, {from: validator_0});

    truffleAssert.eventEmitted(result_1, 'validatorAdded', (ev) => {
      return ev.task_id == 0 && ev.validator == validator_1;
    });

    let validators = await this.tasklist.getValidators(0);
    assert.equal(validators[1], validator_1);
  });

  it('worker tries to add a validator, which is not permitted', async () => {
    truffleAssert.reverts(
      this.tasklist.addValidator(0, worker_2, {from: worker_1}), 
      "Caller is not a validator of this task"
    );
  });

  it('adds worker from the allowed accounts', async () => {
    // validator adds new worker
    let result_1 = await this.tasklist.addWorker(0, worker_1, {from: validator_1});
    truffleAssert.eventEmitted(result_1, 'workerAdded', (ev) => {
      return ev.task_id == 0 && ev.worker == worker_1;
    });
    let workers = await this.tasklist.getWorkers(0);
    assert.equal(workers[0], workers[0]);
  });

  it('worker tries to add a worker, which is not permitted', async () => {
    truffleAssert.reverts(
      this.tasklist.addWorker(0, worker_2, {from: worker_1}), 
      "Caller is not a validator of this task"
    );
  });

  it('adds a validator as worker, which is not permitted', async () => {
    truffleAssert.reverts(
      this.tasklist.addWorker(0, validator_0, {from: validator_0}),
      "Validator cannot be worker"
    );
  });

  it('adds worked hours', async () => {
    let result = await this.tasklist.addWorkedHours(0, 2, {from: worker_1});
    truffleAssert.eventEmitted(
      result, 'workedHoursAdded', (ev) => {
      return ev.task_id == 0 && ev.worker == worker_1 && ev._hours == 2
    });
  });

  it('non-worker tries to add worked hours, which is not permitted', async () => {
    truffleAssert.reverts(
      this.tasklist.addWorkedHours(0, 2, {from: validator_0}),
      "Caller is not a worker of this task"
    )
  });

  it('funds task', async () => {
    const amount = web3.utils.toWei('10', "ether");
    const balance_before = await web3.eth.getBalance(validator_1);
    let result = await this.tasklist.fundTaskEscrow(0, {from: validator_1, value: amount, gasPrice:0});

    // check account balance
    const balance_after = await web3.eth.getBalance(validator_1);
    let value = Number(balance_before) - Number(balance_after);
    assert.equal(value, amount);

    // check deposited amount
    let deposit = await this.tasklist.getTaskDeposit(0);
    assert.equal(deposit, amount);
  });

  it('mints PPCToken to given account according to PPC', async () => {
    let is_minter = await this.ppctoken.isMinter(this.tasklist.address);
    assert.isTrue(is_minter);

    // PPC greater or equal to threshold
    const balance_before = await this.ppctoken.balanceOf(worker_2);
    await this.tasklist.mintPPCTOken(worker_2, 100);

    // check account balance
    const balance_after = await this.ppctoken.balanceOf(worker_2);
    let value = Number(balance_after) - Number(balance_before);
    assert.equal(value, 1);

    // PPC less than threshold
    let result = await this.tasklist.mintPPCTOken(worker_2, 90);
    const event = result.logs[0].args;
    assert.equal(event.account, worker_2);
    assert.equal(event.amount.toNumber(), 0);
  });

  /*
  it('toggles task started', async () => {
    const task_id = 1
    const result = await this.tasklist.toggleStarted(task_id) // starts the task

    // check the task
    const task = await this.tasklist.tasks(task_id)
    assert.equal(task.state.toNumber(), 1) // checks task state

    // check the event
    const event = result.logs[0].args
    assert.equal(event.id.toNumber(), task_id) // checks event task id
    assert.equal(event.state.toNumber(), 1) // check event task state
  })
  */
})