import React, { Component } from "react";
import Web3Container from '../../../lib/Web3Container';
import AddressBook from "../../../contracts/addressBook.json";
import getContract from '../../../lib/getContract'
import Layout from '../../../components/layout';
import { withRouter } from 'next/router';
import { Heading, Form, Field, Select, Input, Button, Box } from 'rimble-ui';


class UpdatePool extends Component {

  state = { reward_contract: this.props.reward_contract, validators: [], 
    accounts: [], book_options: [], new_validator: '' };

  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount = async () => {
    const { reward_contract } = this.state;
    const accounts = await this.props.web3.eth.getAccounts();
    const validators = await reward_contract.methods.getValidators().call();

    const addressbook = await getContract(this.props.web3, AddressBook);

    let book_options = [{ value: false, label: "None"}];
    const participants = await addressbook.methods.getParticipants().call();

    if(validators.includes(accounts[0])){

      // create select list of participants
      for (let i = 0; i < participants.length; i++) {
        const address = participants[i];
        let name = await addressbook.methods.book(address).call();
        book_options.push({ value: address, label: name.concat(' (', address, ')') });
      }
    }

    this.setState({ accounts, validators, book_options });
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
    const { reward_contract, accounts } = this.state;

    if(this.state.fund > 0){
      await reward_contract.methods.fundPool().send({ value: this.state.fund * 10**18, from: accounts[0] });
    }
    if(this.state.book_options.length > 1 && this.state.new_validator.length == 42){
      await reward_contract.methods.addValidator(this.state.new_validator).send({ from: accounts[0] });
    }
    window.location.reload(false);
  }

  render () {

    let val_field = '';

    if(this.state.book_options.length > 1){
      val_field =
      <div>
        <Field label="Add validator:">
          <Select
              required={false}
              onChange = { this.handleChange }
              value = { this.state.new_validator }
              name = "new_validator"
              options={this.state.book_options}
          />
        </Field>
        <br />
      </div>
    }

    return (
      <Box boxShadow={3} m={50} p={20}>
      <Heading as={"h3"} mb={2}>Update pool</Heading>
          <Form onSubmit={this.handleSubmit}>
              <Field label="Fund pool (ether):" >
                  <Input
                  name="fund"
                  type="number"
                  value={this.state.fund}
                  onChange={this.handleChange}
                  />
              </Field>
              <br />
              {val_field}
              <Button type="submit"> Update pool </Button>
          </Form>
      </Box>
    )
  }
}

export default UpdatePool;

// https://stackoverflow.com/questions/36795819/when-should-i-use-curly-braces-for-es6-import/36796281#36796281