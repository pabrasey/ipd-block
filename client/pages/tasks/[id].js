import React, { Component } from "react";
import Web3Container from '../../lib/Web3Container';
import TaskListContract from '../../contracts/TaskList.json';
import Layout from '../../components/layout';
import { AddressList } from '../../components/ethereum';
import WorkedHoursTable from './components/workedHoursTable'
import { withRouter } from 'next/router';
import { Heading, Box, Text, Button, Link, Field } from 'rimble-ui';

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
      const salary = await contract.methods.salary().call();
      const task_id = this.state.task_id;

      const task = await contract.methods.tasks(task_id).call();
      let task_exists = task.id == this.state.task_id; // if the id do not correspond, the task does not exists

      if(task_exists){      
        task.validators = await contract.methods.getValidators(task_id).call();
        task.workers = await contract.methods.getWorkers(task_id).call();
        task.neededFunds = await contract.methods.neededTaskFund(task_id).call();

        // worked hours
        let worked_hours = []
        for (let i = 0; i < task.workers.length; i++) {
            let worker = task.workers[i];
            let hours = await contract.methods.getWorkedHours(task_id, worker).call();
            worked_hours.push({ worker, hours: Number(hours) });
        }
        task.worked_hours = worked_hours;
      }

      this.setState({ task, task_exists, salary: Number(salary) / 10**18 });
    }

  render () {

    const { task_exists, task, accounts, salary } = this.state;

    let button = '';
    let Qrating = '';
    if(task_exists){
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
        if(task.workers.includes(accounts[0]) && task.state < 2){
            button = 
            <Button.Outline as="a" href={"complete/".concat(task.id)} title="Complete task" ml={80}>
                Complete task
            </Button.Outline>
        }
        if(task.state > 2){
            Qrating = <TaskInfo info={"Quality rating"} content={task.Qrating} />
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
            <TaskInfo info={"PPC"} content={task.ppc} />
            <TaskInfo info={"PPC from workers"} content={task.ppc_worker} />
            {Qrating}
            <TaskInfo info={"Available funds"} content={(task.balance / 10**18).toString().concat(" ether")} />
            <TaskInfo info={"Validators"} content={<AddressList addresses={task.validators} />} />
            <WorkedHoursTable worked_hours={task.worked_hours} salary={salary} />
            <Button as="a" href={"update/".concat(task.id)} title="Update task" m={20}>
              Update task
            </Button>
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