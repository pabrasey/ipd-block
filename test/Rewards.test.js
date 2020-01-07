const Rewards = artifacts.require('./Rewards.sol')

const truffleAssert = require('truffle-assertions');

contract('AddressRewardsBook', (accounts) => {

    const validator_1 = accounts[0];
    const funder = accounts[0];
    const validator_2 = accounts[1];

    before(async () => {
        this.rewards = await Rewards.deployed()
    })

    it('deploys successfully', async () => {
        const address = await this.rewards.address
        assert.notEqual(address, 0x0)
        assert.notEqual(address, '')
        assert.notEqual(address, null)
        assert.notEqual(address, undefined)
    });

    it('adds validator', async () => {
        
        // validator already in the list
        truffleAssert.reverts(
            this.rewards.addValidator(accounts[0], {from: accounts[0]}), 
            "This address is already a validator"
        );

        this.rewards.addValidator(accounts[1], {from: accounts[0]});
        let validator = await this.rewards.validators_map(accounts[1]);
        assert.isTrue(validator);
    });

    it('funds pool', async () => {
        const amount = web3.utils.toWei('10', "ether");
        const funder_balance_before = await web3.eth.getBalance(validator_1);
        let contract_balance_before = await this.rewards.getContractBalance();
        await this.rewards.fundPool({from: funder, value: amount, gasPrice:0});
    
        // check validator account balance
        const funder_balance_after = await web3.eth.getBalance(funder);
        let value = Number(funder_balance_before) - Number(funder_balance_after);
        assert.equal(value, amount);
    
        // check deposited amount
        let contract_balance_after = await this.rewards.getContractBalance();
        let contract_diff = contract_balance_after - contract_balance_before;
        assert.equal(contract_diff, amount);
    });

    it('create reward', async () => {

    });

})