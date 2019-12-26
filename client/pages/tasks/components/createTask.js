import React, { Component } from "react";
import { Heading, Form, Textarea, Field, Input, Button, Box } from 'rimble-ui';


class CreateTask extends Component {

  state = { contract: this.props.contract, title: '', description: ''};

  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
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
    const { contract } = this.state;
    const accounts = await this.props.web3.eth.getAccounts();
    await contract.methods.createTask(this.state.title, this.state.description).send({ from: accounts[0] });
    window.location.reload(false); 
  }

  render () {

    return (
      <Box boxShadow={3} m={50} p={20}>
        <Heading as={"h3"} mb={2} >Create new task</Heading>
        <Form onSubmit={this.handleSubmit}>
          <Field label="Title:">
            <Input
              name = "title"
              type = "text"
              value = { this.state.title } 
              onChange = { this.handleChange }
              required = { true }
            >
            </Input>
          </Field>
          <br />
          <Field label="Description:">
            <Textarea
              name = "description"
              value = {this.state.description}
              onChange = {this.handleChange} 
              required = {true}
              placeholder = "bla bla bla"
              rows={4}
            />
          </Field>
          <br />
          <Button type="submit"> Create task </Button>
        </Form>
      </Box>
    )
  }
}

export default CreateTask;