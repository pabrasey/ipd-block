import React, { Component } from "react";
import Web3Container from '../../lib/Web3Container';
import TaskListContract from '../../contracts/TaskList.json';
import Layout from '../../components/layout';
import { AddressList } from '../../components/ethereum';
import WorkedHoursTable from './components/workedHoursTable'
import { withRouter } from 'next/router';
import { Heading, Box, Text, Button, Link, Field } from 'rimble-ui';

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

    state = { contract: this.props.contract, task_id: this.props.router.query.id };

    componentDidMount = async () => {
        const contract = this.state.contract;
        const task_id = this.state.task_id;

        const task = await contract.methods.tasks(task_id).call();
        let task_exists = task.id == this.state.task_id; // if the id do not correspond, the task does not exists

        task.validators = await contract.methods.getValidators(task_id).call();
        task.workers = await contract.methods.getWorkers(task_id).call();

        let worked_hours = []
        for (let i = 0; i < task.workers.length; i++) {
          let worker = task.workers[i];
          let hours = await contract.methods.getWorkedHours(task_id, worker).call();
          worked_hours.push({ worker, hours })   
        }
        task.worked_hours = worked_hours;

        this.setState({ task, task_exists });
    }

  render () {

    const task = this.state.task;

    if(this.state.task_exists){ 
      return (
        <Box boxShadow={3} m={50} p={20}>
            <Heading as={"h3"} mb={2}>Task properties</Heading>
            <TaskInfo info={"Id"} content={task.id} />
            <TaskInfo info={"Title"} content={task.title} />
            <TaskInfo info={"Description"} content={task.description} />
            <TaskInfo info={"Validators"} content={<AddressList addresses={task.validators} />} />
            <WorkedHoursTable worked_hours={task.worked_hours} />
            <Button as="a" href={"update/".concat(task.id)} title="Update taks" m={20}>
              Update task
            </Button>
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