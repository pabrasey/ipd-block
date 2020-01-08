import React, { Component } from "react";
import { Heading, Form, Field, Select, Input, Button, Box } from 'rimble-ui';


class CreateReward extends Component {

  state = { contract: this.props.contract, token: '', amount: ''};

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
    await contract.methods.createReward(this.state.token, this.state.amount).send({ from: accounts[0] });
    window.location.reload(false); 
  }

  render () {

    return (
      <Box boxShadow={3} m={50} p={20}>
        <Heading as={"h3"} mb={2} >Create new reward</Heading>
        <Form onSubmit={this.handleSubmit}>
          <Field label="Token:">
            <Select
                required={true}
                onChange = { this.handleChange }
                value = { this.state.token }
                name = "token"
                options={[
                { value: "0", label: "PPCToken" },
                ]}
            />
          </Field>
          <br />
          <Field label="Amount (integers only) will be multiplied by the token holding of each participant:">
            <Input
              name = "amount"
              type = "number"
              value = {this.state.amount}
              onChange = {this.handleChange} 
              required = {true}
              placeholder = "e.g. 4"
              rows={4}
            />
          </Field>
          <br />
          <Button type="submit"> Create reward </Button>
        </Form>
      </Box>
    )
  }
}

export default CreateReward;