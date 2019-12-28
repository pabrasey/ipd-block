import React, { Component } from "react";
import Web3Container from '../../../lib/Web3Container';
import TaskListContract from '../../../contracts/TaskList.json';
import Layout from '../../../components/layout';
import { withRouter } from 'next/router';
import { Heading, Form, Field, Input, Button, Box } from 'rimble-ui';


class UpdateTask extends Component {

  state = { contract: this.props.contract, new_validator: '', new_worker: '', task_id: this.props.router.query.id,
             task: null };

  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount = async () => {
    const { contract, task_id } = this.state;
    const accounts = await this.props.web3.eth.getAccounts();
    const task = await contract.methods.tasks(task_id).call();
    const task_exists = task.id == task_id; // if the id do not correspond, the task does not exists

    if(task_exists){
      task.validators = await contract.methods.getValidators(task_id).call();
      task.workers = await contract.methods.getWorkers(task_id).call();
    }

    this.setState({ task_exists, task, accounts });
  }

  handleChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    const { contract, accounts } = this.state;

    if(this.state.new_validator.length == 42){
      await contract.methods.addValidator(this.state.task_id, this.state.new_validator).send({ from: accounts[0] });
    }
    if(this.state.new_worker.length == 42){
      await contract.methods.addWorker(this.state.task_id, this.state.new_worker).send({ from: accounts[0] });
    }
    if(this.state.worked_hours > 0){
      await contract.methods.addWorkedHours(this.state.task_id, this.state.worked_hours).send({ from: accounts[0] });
    }
    if(this.state.fund > 0){
      await contract.methods.fundTask(this.state.task_id).send({ value: this.state.fund * 10**18, from: accounts[0] });
    }
    window.location.replace("/tasks/".concat(this.state.task_id)); 
  }

  render () {

    const { task_exists, task, accounts } = this.state;
    let fields = false;

    if(task_exists){
      if(task.validators.includes(accounts[0])){ // if the connected user is a validator
        fields =
        <div>
          <Field label="Add validator (address):" mr={5}>
            <Input
              name="new_validator"
              type="text"
              value={this.state.new_validator}
              onChange={this.handleChange} 
              placeholder="e.g. 0xAc03BB73b6a9e108530AFf4Df5077c2B3D481e5A"
            />
          </Field>
          <Field label="Add Worker (address):" mr={5}>
            <Input
              name="new_worker"
              type="text"
              value={this.state.new_worker}
              onChange={this.handleChange}
              placeholder="e.g. 0xAc03BB73b6a9e108530AFf4Df5077c2B3D481e5A"
            />
          </Field>
          <Field label="Fund task (ether):" >
            <Input
              name="fund"
              type="number"
              value={this.state.fund}
              onChange={this.handleChange}
            />
          </Field>
        </div>
      }
      if(task.workers.includes(accounts[0])){
        fields =
        <Field label="Add worked hours">
          <Input
            name="worked_hours"
            type="number"
            value={this.state.worked_hours}
            onChange={this.handleChange}
          />
        </Field> 
      }
    }

    if(this.state.task_exists){ 
      if(fields != false){
        return (
          <Box boxShadow={3} m={50} p={20}>
          <Heading as={"h3"} mb={2}>Update task with id {this.state.task_id}</Heading>
            <Form onSubmit={this.handleSubmit}>
              {fields}
              <br />
              <Button type="submit"> Update task </Button>
            </Form>
          </Box>
        )
      } else {
        return <Heading as={"h3"} m={20}>You do not have access to modify this task.</Heading>
      }
    } else {
      return <Heading as={"h3"} m={20}>Task with id {this.state.task_id} does not exists</Heading>
    }
  }
}

const UpdateTaskWithRouter = withRouter(UpdateTask);

export default () => (
  <Layout>
    <Web3Container
      renderLoading={() => <div>Loading Dapp Page...</div>}
      contractDefinition={TaskListContract}
      render={({ web3, accounts, contract }) => (
        <UpdateTaskWithRouter accounts={accounts} contract={contract} web3={web3} />
      )}
    />
  </Layout>
)

// https://stackoverflow.com/questions/36795819/when-should-i-use-curly-braces-for-es6-import/36796281#36796281