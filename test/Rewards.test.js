const Rewards = artifacts.require('./Rewards.sol');
const PPCToken = artifacts.require('./PPCToken.sol');

const truffleAssert = require('truffle-assertions');

contract('Rewards', (accounts) => {

    const validator_1 = accounts[0];
    const funder = accounts[6];
    const validator_2 = accounts[1];
    const amount = 2;
    const reward_id = 0;

    before(async () => {
        this.rewards = await Rewards.deployed()
        this.ppctoken = await PPCToken.deployed()
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

        this.rewards.addValidator(validator_2, {from: accounts[0]});
        let validator = await this.rewards.validators_map(validator_2);
        assert.isTrue(validator);
    });

    it('funds pool', async () => {
        const amount = web3.utils.toWei('10', "ether");
        const funder_balance_before = await web3.eth.getBalance(funder);
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
        await this.rewards.createReward(0, amount);
        let count = await this.rewards.reward_count();
        assert.equal(count, 1);
        
        let reward = await this.rewards.rewards(reward_id);
        assert.equal(reward.state, 0);
        assert.equal(reward.token, 0);
        assert.equal(reward.amount, amount);
    });

    it('validates reward', async () => {
        // mint a ppc token
        let is_minter = await this.ppctoken.isMinter(accounts[0]);
        assert.isTrue(is_minter);
        await this.ppctoken.mint(validator_2, 4); 

        // get initial balances
        const eth_balance_before = await web3.eth.getBalance(validator_2);
        const ppc_balance_before = await this.ppctoken.balanceOf(validator_2);

        // validate reward
        await this.rewards.validateReward(reward_id, {from: validator_1});
        let reward = await this.rewards.rewards(reward_id);
        assert.equal(reward.state, 0); // miss one validation
        await this.rewards.validateReward(reward_id, {from: validator_2});

        // check state
         reward = await this.rewards.rewards(reward_id);
        assert.equal(reward.state, 1);

        // check balances
        const eth_amount = web3.utils.toWei((amount * ppc_balance_before).toString(), "ether");
        const eth_balance_after = await web3.eth.getBalance(validator_2);
        const eth_diff = eth_balance_after - eth_balance_before;
        assert.isTrue((eth_amount - eth_diff) / eth_amount < 0.001);

        // try to re-validate reward, which is not allowed
    });
})