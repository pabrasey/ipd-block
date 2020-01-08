import React, { Component } from "react";
import { Table, Form, Field, Button } from 'rimble-ui';

const reward_state = { 0: 'created', 1: 'validated' };
const tokens = { 0: 'PPC' };

class Row extends React.Component {

    state = { id: this.props.reward.id, contract: this.props.contract }

    componentDidMount = async () => {
        const contract = this.state.contract;
        const accounts = await this.props.web3.eth.getAccounts();
        const validators = await contract.methods.getValidators().call();
        const reward = this.props.reward;
        let form = '-';

        if(reward.state == 0 && validators.includes(accounts[0])){
            form = 
            <Form onSubmit={this.validateReward}>
                <Button type="submit"> Validate reward </Button>
            </Form>
        }

        this.setState({ form });
    }

    handleChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
    
        this.setState({
          [name]: value
        });
      }
    
      validateReward = async (event) => {
        event.preventDefault();
        const { contract } = this.state;
        const accounts = await this.props.web3.eth.getAccounts();
        await contract.methods.validateReward(this.state.id).send({ from: accounts[0] });
        window.location.reload(false); 
      }

    render() {
      return (
        <tr>
            <td>{ this.props.reward.id }</td>
            <td>{ reward_state[this.props.reward.state] }</td>
            <td>{ tokens[this.props.reward.token] }</td>
            <td><strong>{ this.props.reward.amount }</strong></td>
            <td>{this.state.form}</td>
        </tr>
      );
    }
  }

class RewardTable extends Component {

    render() {
  
        const rewards = this.props.rewards;
        const contract = this.props.contract;
        const web3 = this.props.web3;

        const rows = [];

        // balances.sort((a, b) => (a.balance < b.balance) ? 1 : -1);

        rewards.forEach((reward, index) => {
            rows.push( <Row reward = { reward } contract = { contract } web3 = { web3 } key = { index } /> );
        });

        return (
            <Table m={50} width={0.9}>
            <thead>
                <tr>
                <th>ID</th>
                <th>State</th>
                <th>Token</th>
                <th>Amount</th>
                <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
            </Table>      
        )      
    }
  }
  
  export default RewardTable;