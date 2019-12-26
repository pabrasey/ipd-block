import React from 'react'
import getWeb3 from './getWeb3'
import getContract from './getContract'

export default class Web3Container extends React.Component {
  state = { web3: null, accounts: null, contract: null };

  async componentDidMount () {
    try {
      const web3 = await getWeb3()
      const accounts = await web3.eth.getAccounts()
      if(this.props.contractDefinition != null){
        const contract = await getContract(web3, this.props.contractDefinition);
        this.setState({ web3, accounts, contract })
      }
      else{
        this.setState({ web3, accounts })
      }
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      )
      console.log(error)
    }
  }

  render () {
    const { web3, accounts, contract } = this.state
    return web3 && accounts
      ? this.props.render({ web3, accounts, contract })
      : this.props.renderLoading()
  }
}
