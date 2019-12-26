import React from 'react'
import Link from 'next/link'
import { Heading, Text } from 'rimble-ui';
import Web3Container from '../../lib/Web3Container'
import TaskListContract from '../../contracts/TaskList.json'
import Layout from '../../components/layout';
import TaskTable from "./components/taskTable";
import CreateTask from "./components/createTask";

class Tasks extends React.Component {

  state = {task_count: 0, tasks: []}

  componentDidMount = async () => {
    const tasklist = this.props.contract;
    const task_count = await tasklist.methods.task_count().call();

    /*
    let tasks = [{
      id: "0",
      title: "A brand new task",
      description: "adfvadf",
      validators: ["0xfc7c87DaC10A9E968FF3280D6Da4314B53bD338A"],
      workers: []
    },
    {
      id: "1",
      title: "A second new task",
      description: "adfvadf",
      validators: ["0xfc7c87DaC10A9E968FF3280D6Da4314B53bD338A"],
      workers: []
    }
  ];*/
    let tasks = [];

    for (var i = 0; i < task_count; i++) {
      const task = await tasklist.methods.tasks(i).call();
      const validators = await tasklist.methods.getValidators(i).call();
      const workers = await tasklist.methods.getWorkers(i).call();
      task.validators = validators;
      task.workers = workers;
      tasks.push(task);
    }
    this.setState({task_count, tasks})
  }

  render () {
    return(
      <Layout>
        <div className="App">
          <Heading as={"h1"} textAlign={'center'} >IPD Task Manager</Heading>
          <Text textAlign={'center'} >The number of tasks is: { this.state.task_count }</Text>
        </div>
        <TaskTable tasks = { this.state.tasks } />
        <CreateTask web3 = {this.props.web3} contract = {this.props.contract} />
      </Layout>
    )
  }
}

export default () => (
  <Web3Container
    renderLoading={() => <div>Loading Dapp Page...</div>}
    contractDefinition={TaskListContract}
    render={({ web3, accounts, contract }) => (
      <Tasks accounts={accounts} contract={contract} web3={web3} />
    )}
  />
)
