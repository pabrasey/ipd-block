import React, { Component } from "react";
import Web3Container from '../../lib/Web3Container';
import TaskListContract from '../../contracts/TaskList.json';
import Layout from '../../components/layout';
import { AddressList } from '../../components/ethereum';
import WorkersTable from './components/workersTable';
import ValidationsTable from './components/validationsTable';
import { withRouter } from 'next/router';
import { Heading, Box, Text, Form, Button } from 'rimble-ui';

const task_state = { 0: 'created', 1: 'accepted', 2: 'completed', 3: 'validated' };

class TaskInfo extends Component {

    render () {
        return (
            <div>
              <Text><strong>{this.props.info}:</strong> {this.props.content}</Text>
            </div>
        )
    }

}

class ViewTask extends Component {

  state = { contract: this.props.contract, accounts: this.props.accounts, task_id: this.props.router.query.id };

  componentDidMount = async () => {
    const contract = this.state.contract;
    const hourly_rate = await contract.methods.hourly_rate().call();
    const task_id = this.state.task_id;

    const task = await contract.methods.tasks(task_id).call();
    let task_exists = task.id == this.state.task_id; // if the id do not correspond, the task does not exists

    if(task_exists){      
      task.validators = await contract.methods.getValidators(task_id).call();
      task.workers = await contract.methods.getWorkers(task_id).call();
      task.neededFunds = await contract.methods.neededTaskFund(task_id).call();

      // worked hours
      let workers_info = []
      for (let i = 0; i < task.workers.length; i++) {
          let worker = task.workers[i];
          let hours = await contract.methods.getWorkedHours(task_id, worker).call();
          let completion = await contract.methods.getCompletion(task_id, worker).call();
          workers_info.push({ worker, hours: Number(hours), ppc: Number(completion.ppc) });
      }
      task.workers_info = workers_info;

      // validations
      let validations = []
      for (let i = 0; i < task.validators.length; i++) {
          let validator = task.validators[i];
          let validation = await contract.methods.getValidation(task_id, validator).call();
          validations.push({ validator, ppc: Number(validation.ppc), Qrating: Number(validation.Qrating) });
      }
      task.validations = validations;
    }

    this.setState({ task, task_exists, hourly_rate: Number(hourly_rate) / 10**18 });
  }

  acceptTask = async (event) => {
    event.preventDefault();
    const { contract, accounts } = this.state;
    await contract.methods.acceptTask(this.state.task_id).send({ from: accounts[0] });
    window.location.reload(false);
  }

  render () {

    const { task_exists, task, accounts, hourly_rate } = this.state;

    let update_button = '';
    let button = '';
    let validations = '';
    if(task_exists){
        // update button
        if(task.workers.includes(accounts[0]) && task.state == 1 || task.validators.includes(accounts[0]) && task.state < 3){
          update_button =
            <Button as="a" href={"update/".concat(task.id)} title="Update task" m={20}>
              Update task
            </Button>
        }

        // validate button
        if(task.validators.includes(accounts[0]) && task.ppc_worker != 0 && task.state == 2){
            if(Number(task.balance) >= Number(task.neededFunds)){
              button = 
              <Button.Outline as="a" href={"validate/".concat(task.id)} title="Validate task" ml={80}>
                  Validate task
              </Button.Outline>
            } else {
              button = 
              <Button.Outline as="a" href={"update/".concat(task.id)} title="Update task" ml={80}>
                  Add funds before validating task
              </Button.Outline>
            }
        }
        // accept task button
        if(task.workers.includes(accounts[0])){
          if(task.state == 0){
            button = 
            <Form onSubmit={this.acceptTask}>
              <Button type="submit" title="Accept task" ml={80}>
                  Accept task
              </Button>
            </Form>
          }
          if(task.state == 1){
            button = 
            <Button.Outline as="a" href={"complete/".concat(task.id)} title="Complete task" ml={80}>
                Complete task
            </Button.Outline>
          }
        }
        // rating information
        if(task.state > 2){
            validations = 
            <div>
              <TaskInfo info={"PPC"} content={task.ppc} />
              <TaskInfo info={"Quality rating"} content={task.Qrating} />
            </div>
        }
    }

    if(this.state.task_exists){ 
      return (
        <Box boxShadow={3} m={50} p={20}>
            <Heading as={"h3"} mb={2}>Task properties</Heading>
            <TaskInfo info={"Id"} content={task.id} />
            <TaskInfo info={"Title"} content={task.title} />
            <TaskInfo info={"State"} content={task_state[task.state]} />
            <TaskInfo info={"Description"} content={task.description} />
            <TaskInfo info={"PPC from workers"} content={task.ppc_worker} />
            {validations}
            <TaskInfo info={"Available funds"} content={(task.balance / 10**18).toString().concat(" ether")} />
            <WorkersTable workers_info={task.workers_info} hourly_rate={hourly_rate} />
            <ValidationsTable validations={task.validations} />
            {update_button}
            {button}
        </Box>
      )
    } else {
      return <Heading as={"h3"} m={20}>Task with id {this.state.task_id} does not exists</Heading>
    }
  }
}

const ViewTaskWithRouter = withRouter(ViewTask);

export default () => (
    <Layout>
        <Web3Container
        renderLoading={() => <div>Loading Dapp Page...</div>}
        contractDefinition={TaskListContract}
        render={({ web3, accounts, contract }) => (
            <ViewTaskWithRouter accounts={accounts} contract={contract} web3={web3} />
        )}
        />
    </Layout>
)

// https://stackoverflow.com/questions/36795819/when-should-i-use-curly-braces-for-es6-import/36796281#36796281