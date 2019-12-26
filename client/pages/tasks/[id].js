import React, { Component } from "react";
import Web3Container from '../../lib/Web3Container';
import TaskListContract from '../../contracts/TaskList.json';
import Layout from '../../components/layout';
import { AddressList } from '../../components/ethereum';
import { withRouter } from 'next/router';
import { Heading, Box, Text } from 'rimble-ui';

class TaskInfo extends Component {

    render () {
        return (
            <Text>{this.props.info}: {this.props.content}</Text>
        )
    }

}

class UpdateTask extends Component {

    state = { contract: this.props.contract, task_id: this.props.router.query.id };

    componentDidMount = async () => {
        const contract = this.state.contract;
        const task_id = this.state.task_id;

        const task = await contract.methods.tasks(task_id).call();
        const task_exists = task.id == this.state.task_id; // if the id do not correspond, the task does not exists

        task.validators = await contract.methods.getValidators(task_id).call();
        task.workers = await contract.methods.getWorkers(task_id).call();

        this.setState({ task, task_exists });
    }

  render () {

    const task = this.state.task;

    if(this.state.task_exists){ 
      return (
        <Box boxShadow={3} m={50} p={20}>
            <Heading as={"h3"} mb={2}>Task properties</Heading>
            <TaskInfo info={"id"} content={task.id} />
            <TaskInfo info={"title"} content={task.title} />
            <TaskInfo info={"description"} content={task.description} />
            <TaskInfo info={"validators"} content={<AddressList addresses={task.validators} />} />
            <TaskInfo info={"workers"} content={<AddressList addresses={task.workers} />} />
        </Box>
      )
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