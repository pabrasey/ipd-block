import React from 'react'
import { Heading, Box, Text } from 'rimble-ui';
import Web3Container from '../../lib/Web3Container'
import Layout from '../../components/layout';
import Rewards from '../../contracts/Rewards.json'

import CreateReward from "./components/createReward";
import UpdatePool from "./components/updatePool";
import RewardTable from "./components/rewardTable";
import { AddressList } from '../../components/ethereum';

class RewardsComp extends React.Component {

    state = { reward_count: 0, rewards: [], validators: [] }

    componentDidMount = async () => {
        const contract = this.props.contract;
        const accounts = await this.props.web3.eth.getAccounts();

        const reward_count = await contract.methods.reward_count().call();
        const reward_pool = await contract.methods.getContractBalance().call();
        const validators = await contract.methods.getValidators().call();

        let rewards = [];

        for (var i = 0; i < reward_count; i++) {
            const reward = await contract.methods.rewards(i).call();
            rewards.push(reward);
        }
    
        this.setState({ reward_count, rewards, reward_pool: Number(reward_pool) / 10**18, validators });
    }

    render () {
        return(
            <Layout>
                <Heading as={"h1"} textAlign={'center'}>Rewards</Heading>
                <Text textAlign={'center'} >The number of rewards is: { this.state.reward_count }</Text>
                <Text textAlign={'center'} >The reward pool contains: { this.state.reward_pool } ether</Text>
                <RewardTable rewards = {this.state.rewards} contract = {this.props.contract} web3 = {this.props.web3} />
                <Box boxShadow={3} m={50} p={20}>
                    <Heading as={"h3"}>Validators</Heading>
                    <AddressList addresses={this.state.validators} />
                </Box>
                <CreateReward web3 = {this.props.web3} contract = {this.props.contract} />
                <UpdatePool validators={this.state.validators} web3 = {this.props.web3} reward_contract = {this.props.contract} />
            </Layout>
        )
    }
}   
    
export default () => (
    <Web3Container
    renderLoading={() => <div>Loading Dapp Page...</div>}
    contractDefinition={Rewards}
    render={({ web3, accounts, contract }) => (
        <RewardsComp accounts={accounts} contract={contract} web3={web3} />
    )}
    />
)
    