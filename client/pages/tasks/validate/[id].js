import React, { Component } from "react";
import Web3Container from '../../../lib/Web3Container';
import TaskListContract from '../../../contracts/TaskList.json';
import Layout from '../../../components/layout';
import { withRouter } from 'next/router';
import { Heading, Form, Field, Input, Button, Box } from 'rimble-ui';


class ValidateTask extends Component {

  state = { contract: this.props.contract, task_id: this.props.router.query.id, task: null };

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

    await contract.methods.validateTask(this.state.task_id, this.state.ppc, this.state.Qrating)
    .send({ from: accounts[0] });

    window.location.replace("/tasks/".concat(this.state.task_id)); 
  }

  render () {

    const { task_exists, task, accounts} = this.state;
    let fields = false;

    if(task_exists){
        if(task.validators.includes(accounts[0])){
            fields =
            <div>
                <Field label="Percent planned completed">
                <Input
                    name="ppc"
                    type="number"
                    value={this.state.ppc}
                    onChange={this.handleChange}
                    required={true}
                    placeholder="1 - 100"
                />
                </Field>
                <Field label="Quality rating" ml={40}>
                <Input
                    name="Qrating"
                    type="number"
                    value={this.state.Qrating}
                    onChange={this.handleChange}
                    required={true}
                    placeholder="1 - 10"
                />
                </Field>
            </div>
        }
    }

    if(task_exists){ 
        if(fields != false){
            return (
            <Box boxShadow={3} m={50} p={20}>
            <Heading as={"h3"} mb={2}>Validate task with id {this.state.task_id}</Heading>
                <Form onSubmit={this.handleSubmit}>
                {fields}
                <br />
                <Button type="submit" variant="success"> Validate task </Button>
                </Form>
            </Box>
            )
      } else {
        return <Heading as={"h3"} m={20}>You do not have access to validate this task.</Heading>
      }
    } else {
        return <Heading as={"h3"} m={20}>Task with id {this.state.task_id} does not exists</Heading>
    }
  }
}

const ValidateTaskWithRouter = withRouter(ValidateTask);

export default () => (
  <Layout>
    <Web3Container
      renderLoading={() => <div>Loading Dapp Page...</div>}
      contractDefinition={TaskListContract}
      render={({ web3, accounts, contract }) => (
        <ValidateTaskWithRouter accounts={accounts} contract={contract} web3={web3} />
      )}
    />
  </Layout>
)

// https://stackoverflow.com/questions/36795819/when-should-i-use-curly-braces-for-es6-import/36796281#36796281