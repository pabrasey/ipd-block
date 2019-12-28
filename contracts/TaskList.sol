pragma solidity ^0.5.11;

import '../node_modules/@openzeppelin/contracts/payment/escrow/Escrow.sol';
import './PPCToken.sol';

contract TaskList {
	uint public task_count = 0;
	enum State { created, accepted, completed, validated }
	uint8[] ratings = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	uint8 ppc_threshold = 90;
	// enum Difficulty { standard, advanced , expert }
	// enum Uncertainity { clear, uncertain, unknown }
	PPCToken private ppctoken;

	constructor (address _ppctoken_address) public {
		ppctoken = PPCToken(_ppctoken_address);
	}

	struct Task {
		uint id;
		string title;
		string description;
		State state;
		uint deadline;
		uint8 Qrating;
		uint8 ppc;
		uint8 ppc_worker;
		mapping(address => bool) validators_map;
		address[] validators;
		mapping(address => bool) workers_map;
		address[] workers;
		mapping(address => uint) worked_hours;
		Escrow escrow;
		//uint predecessor_id;
		//uint successor_id;
	}

	mapping(uint => Task) public tasks;

	event TaskCreated(
		uint id,
		string title,
		State state,
		address[] validators
	);

	event Test(bool is_true);

	modifier validatorsOnly(uint _task_id) {
		// checks that the sender is a validator of task
		require(tasks[_task_id].validators_map[msg.sender], "Caller is not a validator of this task");
		_;
	}

	modifier workersOnly(uint _task_id, address _account) {
		require(tasks[_task_id].workers_map[_account], "Worker is not assigned to this task");
		_;
	}

	event TaskState(
		uint id,
		State state
	);

	event validatorAdded(
		uint task_id,
		address validator
	);

	event workerAdded(
		uint task_id,
		address worker
	);

	event workedHoursAdded(
		uint task_id,
		address worker,
		uint _hours
	);

	event taskFunded(
		uint task_id,
		address sender,
		address receiver,
		uint256 amount
	);

	event PPCTokenMinted(
		address account,
		uint amount
	);

	function createTask(string memory _title, string memory _description) public {
		uint _id = task_count;
		Task memory task = Task({
			id: _id,
			title: _title,
			description: _description,
			state: State.created,
			deadline: 0,
			Qrating: 0,
			ppc: 0,
			ppc_worker: 0,
			validators: new address[](0),
			workers: new address[](0),
			escrow: new Escrow()
		});
		// https://medium.com/loom-network/ethereum-solidity-memory-vs-storage-how-to-initialize-an-array-inside-a-struct-184baf6aa2eb
		tasks[_id] = task;
		task_count++;
		tasks[_id].validators.push(msg.sender);
		tasks[_id].validators_map[msg.sender] = true;
		emit TaskCreated(_id, _title, State.created, tasks[_id].validators);
	}

	function addValidator(uint _task_id, address _validator) public validatorsOnly(_task_id) {
		require(!tasks[_task_id].workers_map[_validator], "Worker cannot be validator");
		Task storage _task = tasks[_task_id];
		_task.validators.push(_validator);
		_task.validators_map[_validator] = true;
		emit validatorAdded(_task_id, _validator);
	}

	function getValidators(uint _task_id) public view returns (address[] memory) {
		return tasks[_task_id].validators;
	}

	function addWorker(uint _task_id, address _worker) public validatorsOnly(_task_id) {
		require(!tasks[_task_id].validators_map[_worker], "Validator cannot be worker");
		Task storage _task = tasks[_task_id];
		_task.workers.push(_worker);
		_task.workers_map[_worker] = true;
		_task.worked_hours[_worker] = 0;
		emit workerAdded(_task_id, _worker);
	}

	function getWorkers(uint _task_id) public view returns (address[] memory) {
		return tasks[_task_id].workers;
	}

	function addWorkedHours(uint _task_id, uint _hours) public workersOnly(_task_id, msg.sender) {
		Task storage _task = tasks[_task_id];
		_task.worked_hours[msg.sender] += _hours;
		emit workedHoursAdded(_task_id, msg.sender, _hours);
	}

	function getWorkedHours(uint _task_id, address _worker) public view returns (uint) {
		return tasks[_task_id].worked_hours[_worker];
	}

	function fundTaskEscrow(uint _task_id) public payable {
		// stores funds for the given task its corresponding escrow
		Task storage _task = tasks[_task_id];

		_task.escrow.deposit.value(msg.value)(_task.workers[0]);
		// the 1st worker will get the payment -> add split payment later
		emit taskFunded(_task_id, msg.sender, _task.workers[0], msg.value);
	}

	function getTaskDeposit(uint _task_id) public view returns (uint256) {
		Task memory _task = tasks[_task_id];
		return _task.escrow.depositsOf(_task.workers[0]);
	}

	function completeTask(uint _task_id, uint8 _ppc) public workersOnly(_task_id, msg.sender) {
		Task storage _task = tasks[_task_id];
		_task.ppc_worker = _ppc;
		_task.state = State.completed;
	}

	function validateTask(uint _task_id, uint8 _ppc, uint8 _Qrating) public validatorsOnly(_task_id) {
		// todo: add state check
		Task storage _task = tasks[_task_id];
		if(_ppc >= _task.ppc_worker) {
			_task.ppc = _ppc;
			_task.state = State.validated;
			_task.Qrating = _Qrating;
			mintPPCTOken(_task_id);
		} else {
			_task.ppc = _ppc;
		}
	}

	function mintPPCTOken(uint _task_id) public {
		Task memory _task = tasks[_task_id];
		if(_task.ppc >= ppc_threshold) {
			for(uint16 i = 0; i < _task.workers.length; i++) {
				address _worker = _task.workers[i];
				ppctoken.mint(_worker, 1);
				emit PPCTokenMinted(_worker, 1);
			}
		}
	}

	function toggleStarted(uint8 _id) public {
		Task storage _task = tasks[_id];
		_task.state = State.accepted;
		// tasks[_id] = _task;
		emit TaskState(_id, _task.state);
	}

}