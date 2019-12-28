import React from 'react'
import Link from 'next/link'
import { Heading, Text } from 'rimble-ui';
import Web3Container from '../../lib/Web3Container'
import Layout from '../../components/layout';
import PPCTokenContract from '../../contracts/PPCToken.json'
import BalanceTable from "./components/balanceTable";

class Tasks extends React.Component {

    state = { ppc_balances: [] }

    componentDidMount = async () => {
        const ppctoken = this.props.contract;
        const accounts = await this.props.web3.eth.getAccounts();
        accounts.push("0x8980612Ff293cB12527D56EF375db8CCd1fB7E61", "0x299818F98284FC7dbE0721827A5678FD091B91A2", 
        "0x1AEf5FCA1cd59978214b70bd734334F3f93F88be", "0xebd7F835f3E3c80ab1F2F3F05dd40398EeA4d1F7");

        let ppc_balances = [];
        for(var i = 0; i < accounts.length; i++){
          let balance = await ppctoken.methods.balanceOf(accounts[i]).call();
          let el = {account: accounts[i], balance: balance};
          ppc_balances.push(el);
        };
        console.log('ppc_balances: ', ppc_balances);
    
        this.setState({ ppc_balances });
    }

    render () {
        return(
            <Layout>
                <Heading as={"h1"} textAlign={'center'}>IPD Tokens</Heading>
                <BalanceTable balances = { this.state.ppc_balances } />
            </Layout>
        )
    }
}   
    
export default () => (
    <Web3Container
    renderLoading={() => <div>Loading Dapp Page...</div>}
    contractDefinition={PPCTokenContract}
    render={({ web3, accounts, contract }) => (
        <Tasks accounts={accounts} contract={contract} web3={web3} />
    )}
    />
)
    