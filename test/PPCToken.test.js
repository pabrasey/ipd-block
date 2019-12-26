const PPCToken = artifacts.require('./PPCToken.sol')

const truffleAssert = require('truffle-assertions');

contract('PPCToken', (accounts) => {

  const worker_1 = accounts[2];

  before(async () => {
    this.ppctoken = await PPCToken.deployed()
  })

  it('deploys successfully', async () => {
    const address = await this.ppctoken.address
    assert.notEqual(address, 0x0)
    assert.notEqual(address, '')
    assert.notEqual(address, null)
    assert.notEqual(address, undefined)
  })

  it('mints token to given address', async () => {
    //console.log(this.ppctoken)
    let is_minter = await this.ppctoken.isMinter(accounts[0]);
    assert.isTrue(is_minter);
    
    const amount = 1;
    const balance_before = await this.ppctoken.balanceOf(worker_1);
    await this.ppctoken.mint(worker_1, amount); 

    // check account balance
    const balance_after = await this.ppctoken.balanceOf(worker_1);
    let value = Number(balance_after) - Number(balance_before);
    assert.equal(value, amount);
  })

})