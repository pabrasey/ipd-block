pragma solidity ^0.5.11;

import './PPCToken.sol';
import './AddressBook.sol';

contract Rewards{

	/*
	------------	DATA & TYPES   ------------
	*/

    uint public reward_count = 0;

    enum State { created, validated }

    enum Token { ppc }

    address[] public validators;
    mapping(address => bool) public validators_map;

    PPCToken private ppctoken;
    AddressBook public addressbook;

    uint one_ether = 1 ether;

    struct Reward {
        uint id;
        State state;
        Token token;
        uint amount;
        mapping(address => bool) validations;
    }

    mapping(uint => Reward) public rewards;

    constructor (address _ppctoken_address, address _addressbook_address) public {
		ppctoken = PPCToken(_ppctoken_address);
        addressbook = AddressBook(_addressbook_address);

        // add deployer as validator
        validators.push(msg.sender);
		validators_map[msg.sender] = true;
	}

	/*
	------------	MODIFIERS    ------------
	*/

    modifier validatorsOnly() {
		// checks that the sender is a validator of task
		require(validators_map[msg.sender], "Caller is not a reward validator");
		_;
	}

	/*
	------------	FUNCTIONS    ------------
	*/

    // adds a validator
    function addValidator(address _validator) public validatorsOnly {

        require(!validators_map[_validator], "This address is already a validator");

		validators.push(_validator);
		validators_map[_validator] = true;
	}

    // get the array of validators
	function getValidators() public view returns (address[] memory) {
		return validators;
	}

    // stores ether in this contract (the reward pool)
    function fundPool() public payable {
        // ethers are automatically stored in the contract just by implementing this payable function
	}

    // proposes to give a (_amount * _token holding) reward in _coin to all _token holders in the address_book
    // TODO: restrict access to project participants
    function createReward(Token _token, uint _amount) public {

        uint _id = reward_count;

        Reward memory _reward = Reward ({
            id: _id,
            state: State.created,
            token: _token,
            amount: _amount
        });

        rewards[_id] = _reward;
        reward_count++;
    }

    // validates the given reward from the validator calling the function
    function validateReward(uint _reward_id) public validatorsOnly {

        require(rewards[_reward_id].state == State.created, "This reward does not exists or is already validated");

        Reward storage _reward = rewards[_reward_id];

        _reward.validations[msg.sender] = true;
        bool validated = false;

        // go through every validator's validation
        for(uint16 i = 0; i < validators.length; i++) {
            validated = _reward.validations[validators[i]];
        }
        // accept the task if all validators have validated it;
        if(validated){
            _reward.state = State.validated;
            sendReward(_reward_id);
        }
    }

    //TODO: check sufficient founds

    // sends (_amount * _token holding) reward in ether to all _token holders in the address_book
    function sendReward(uint _reward_id) internal {

        Reward storage _reward = rewards[_reward_id];

        address payable[] memory _participants = addressbook.getParticipants();

        for(uint i = 0; i < _participants.length; i++) {

            address payable _participant = _participants[i];
            uint eth_amount = 0;

            if(_reward.token == Token.ppc){
                eth_amount = _reward.amount * ppctoken.balanceOf(_participant) * one_ether;
            }

            _participant.transfer(eth_amount);
        }
    }

    // returns the amount of ether stored in this contract
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

}