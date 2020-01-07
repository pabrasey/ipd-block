const AddressBook = artifacts.require('./AddressBook.sol')

const truffleAssert = require('truffle-assertions');

contract('AddressBook', (accounts) => {

    before(async () => {
        this.addressbook = await AddressBook.deployed()
    })

    it('deploys successfully', async () => {
        const address = await this.addressbook.address
        assert.notEqual(address, 0x0)
        assert.notEqual(address, '')
        assert.notEqual(address, null)
        assert.notEqual(address, undefined)
    })

    it('adds participant', async () => {
        
        // participant already in the list
        truffleAssert.reverts(
            this.addressbook.addParticipant(accounts[0], "fail", {from: accounts[0]}), 
            "This address is already a participant"
        );

        this.addressbook.addParticipant(accounts[4], "Antoine", {from: accounts[0]});
        let count = await this.addressbook.participant_count();
        let participants = await this.addressbook.getParticipants();
        let participant = await this.addressbook.book(participants[Number(count) - 1]);
        assert.equal(participant, "Antoine");
    })

})