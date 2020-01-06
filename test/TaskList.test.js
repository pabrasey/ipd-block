// @ts-nocheck
const PPCToken = artifacts.require('./PPCToken.sol')
const TaskList = artifacts.require('./TaskList.sol')

const truffleAssert = require('truffle-assertions');

contract('TaskList Tests', (accounts) => {

  const validator_1 = accounts[0];
  const validator_2 = accounts[1];
  const worker_1 = accounts[2];
  const worker_hours_1 = 2;
  const worker_hours_2 = 3;
  const worker_2 = accounts[3];
  const task_id = 4;

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
    const task = await this.tasklist.tasks(task_id);
    assert.equal(task.title, 'A new task');

    const task_count = await this.tasklist.task_count();
    assert.equal(task_count.toNumber(), 1 + task_id);

    let validators = await this.tasklist.getValidators(task_id);
    assert.equal(validators[0], accounts[0]);

    // check the event
    const event = result.logs[0].args
    assert.equal(event.id.toNumber(), task_id)
    assert.equal(event.title, 'A new task')
    assert.equal(event.state.toNumber(), 0)
    assert.equal(event.validators[0], accounts[0])
  });

  it('adds validator from the allowed accounts', async () => {
    // validator adds new validator
    let result_1 = await this.tasklist.addValidator(task_id, validator_2, {from: validator_1});

    truffleAssert.eventEmitted(result_1, 'validatorAdded', (ev) => {
      return ev.task_id == task_id && ev.validator == validator_2;
    });

    let validators = await this.tasklist.getValidators(task_id);
    assert.equal(validators[1], validator_2);
  });

  it('worker tries to add a validator, which is not permitted', async () => {
    truffleAssert.reverts(
      this.tasklist.addValidator(task_id, worker_2, {from: worker_1}), 
      "Caller is not a validator of this task"
    );
  });

  it('adds worker from the allowed accounts', async () => {
    // validator adds new worker
    let result_1 = await this.tasklist.addWorker(task_id, worker_1, {from: validator_2});
    await this.tasklist.addWorker(task_id, worker_2, {from: validator_2});
    truffleAssert.eventEmitted(result_1, 'workerAdded', (ev) => {
      return ev.task_id == task_id && ev.worker == worker_1;
    });
    let workers = await this.tasklist.getWorkers(task_id);
    assert.equal(workers[0], workers[0]);
  });

  it('worker tries to add a worker, which is not permitted', async () => {
    truffleAssert.reverts(
      this.tasklist.addWorker(task_id, worker_2, {from: worker_1}), 
      "Caller is not a validator of this task"
    );
  });

  it('adds a validator as worker, which is not permitted', async () => {
    truffleAssert.reverts(
      this.tasklist.addWorker(task_id, validator_1, {from: validator_1}),
      "Validator cannot be worker"
    );
  });

  it('accepts the task', async () => {
    // first worker accepts the task but it is still not accepted
    this.tasklist.acceptTask(task_id, {from: worker_1});
    let task = await this.tasklist.tasks(task_id);
    assert.equal(task.state, 0);

    // as soon as the all workers have accepted the task, its state changes to accepted
    this.tasklist.acceptTask(task_id, {from: worker_2});
    task = await this.tasklist.tasks(task_id);
    assert.equal(task.state, 1);
  });

  it('adds worked hours', async () => {
    let result = await this.tasklist.addWorkedHours(task_id, worker_hours_1, {from: worker_1});
    truffleAssert.eventEmitted(
      result, 'workedHoursAdded', (ev) => {
      return ev.task_id == task_id && ev.worker == worker_1 && ev._hours == worker_hours_1
    });
    let hours = await this.tasklist.getWorkedHours(task_id, worker_1);
    assert.equal(hours, worker_hours_1)
  });

  it('non-worker tries to add worked hours, which is not permitted', async () => {
    truffleAssert.reverts(
      this.tasklist.addWorkedHours(task_id, 2, {from: validator_1}),
      "Worker is not assigned to this task"
    )
  });

  it('funds task', async () => {
    const amount = web3.utils.toWei('10', "ether");
    const validator_balance_before = await web3.eth.getBalance(validator_1);
    let contract_balance_before = await this.tasklist.getContractBalance();
    let result = await this.tasklist.fundTask(task_id, {from: validator_1, value: amount, gasPrice:0});

    // check validator account balance
    const balance_after = await web3.eth.getBalance(validator_1);
    let value = Number(validator_balance_before) - Number(balance_after);
    assert.equal(value, amount);

    // check deposited amount
    let contract_balance_after = await this.tasklist.getContractBalance();
    let contract_diff = contract_balance_after - contract_balance_before;
    let task = await this.tasklist.tasks(task_id);
    let task_balance = await task.balance;
    assert.equal(contract_diff, amount, task_balance);
  });

  it('completes task', async () => {
    await this.tasklist.completeTask(task_id, 100, {from: worker_1});
    let task = await this.tasklist.tasks(task_id);
    assert.equal(task.ppc_worker, 100);
    assert.equal(task.state, 2);
  });

  it('validates task and mints PPCToken', async () => {
    let task = await this.tasklist.tasks(task_id);

    // add worked hours to secnd worker
    await this.tasklist.addWorkedHours(task_id, worker_hours_2, {from: worker_2});

    // check that the tasklist contract instance has the right to mint PPCTokens
    const is_minter = await this.ppctoken.isMinter(this.tasklist.address);
    assert.isTrue(is_minter);

    // compute initial balances
    const ppc_balance_before = await this.ppctoken.balanceOf(worker_1);
    const contract_balance_before = await this.tasklist.getContractBalance();
    const task_balance_before = await task.balance;
    const payer_balance_before = await web3.eth.getBalance(validator_1);

    const suf = await this.tasklist.sufficientFunds(task_id);
    assert.isTrue(suf);

    // validate task from both validators
    await this.tasklist.validateTask(task_id, 100, 10, {from: validator_1});
    await this.tasklist.validateTask(task_id, 100, 5, {from: validator_2});

    task = await this.tasklist.tasks(task_id);
    
    // check rating values
    assert.equal(task.ppc, 100);
    assert.equal(task.state, 3);
    assert.equal(task.Qrating, 7);

    // check ppc_balance
    const ppc_balance_after = await this.ppctoken.balanceOf(worker_1);
    const ppc_diff = Number(ppc_balance_after) - Number(ppc_balance_before);
    assert.equal(ppc_diff, 1);

    // check paid amount
    const hourly_rate = await this.tasklist.hourly_rate();
    const amount_paid = hourly_rate * (worker_hours_1 + worker_hours_2);

    // check task balance
    const task_balance_after = await task.balance;
    assert.equal(Number(task_balance_after), 0);

    // check payer balance
    const payer_balance_after = await web3.eth.getBalance(validator_1);
    const amount_back = payer_balance_after - payer_balance_before
    const rest = task_balance_before - amount_paid;
    assert.isTrue((rest - amount_back) / rest < 0.001);

    // check contract balance
    const contract_balance_after = await this.tasklist.getContractBalance();
    const contract_diff = Number(contract_balance_before) - Number(contract_balance_after);
    assert.equal(contract_diff, amount_paid + rest);
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