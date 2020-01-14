pragma solidity ^0.5.11;

contract AddressBook {

    /*
        This contract is the address book for the project
        linking addresses to names of individuals, teams or companies
    */

    uint public participant_count = 0;

    address payable[] public participants;
    mapping(address => string) public book;

    constructor(string memory _name) public {
        participants.push(msg.sender);
        book[msg.sender] = _name;
        participant_count++;
    }

    modifier participantsOnly() {
		// checks that the sender is a validator of task
		require(bytes(book[msg.sender]).length > 0, "Caller is not a participant");
		_;
	}

    function addParticipant(address payable _address, string memory _name) public participantsOnly() {

        require(bytes(book[_address]).length == 0, "This address is already a participant");

        participants.push(_address);
        book[_address] = _name;
        participant_count++;
    }

	function getParticipants() public view returns (address payable[] memory) {
		return participants;
	}

}