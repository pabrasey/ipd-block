import React from 'react'
import Link from 'next/link'
import { Heading, Text } from 'rimble-ui';
import Web3Container from '../../lib/Web3Container'
import Layout from '../../components/layout';
import PPCTokenContract from '../../contracts/PPCToken.json'
import BalanceTable from "./components/balanceTable";

class Tokens extends React.Component {

    state = { balances: [] }

    componentDidMount = async () => {
        const ppctoken = this.props.contract;
        const accounts = await this.props.web3.eth.getAccounts();
        accounts.push(
        // truffle:
            "0xfc7c87DaC10A9E968FF3280D6Da4314B53bD338A", "0x2C9DCb6C629C28516Efd5FcE50cD9a9cC6e90892", 
        "0x8980612Ff293cB12527D56EF375db8CCd1fB7E61", "0xc4B5241eE80C7A901A7e6854ba3132BcCCaD1F5b", 
        // ganache:
        "0x299818F98284FC7dbE0721827A5678FD091B91A2", "0x1AEf5FCA1cd59978214b70bd734334F3f93F88be", "0xebd7F835f3E3c80ab1F2F3F05dd40398EeA4d1F7");

        let balances = [];
        for(var i = 0; i < accounts.length; i++){
          let ppc_balance = await ppctoken.methods.balanceOf(accounts[i]).call();
          let eth_balance = await this.props.web3.eth.getBalance(accounts[i]);
          let el = {account: accounts[i], balances: [eth_balance, ppc_balance]};
          balances.push(el);
        };
        console.log('balances: ', balances);
    
        this.setState({ balances });
    }

    render () {
        return(
            <Layout>
                <Heading as={"h1"} textAlign={'center'}>Tokens</Heading>
                <BalanceTable balances = { this.state.balances } />
            </Layout>
        )
    }
}   
    
export default () => (
    <Web3Container
    renderLoading={() => <div>Loading Dapp Page...</div>}
    contractDefinition={PPCTokenContract}
    render={({ web3, accounts, contract }) => (
        <Tokens accounts={accounts} contract={contract} web3={web3} />
    )}
    />
)
    