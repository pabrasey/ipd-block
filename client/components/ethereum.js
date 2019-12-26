import React, { Component } from "react";
import { EthAddress } from 'rimble-ui';

export class AddressList extends React.Component {
    render() {
      const addresses = this.props.addresses;
  
      let list = [];
      addresses.forEach((address, index) => {
        list.push(<EthAddress address = {address} key = {index} />);
      });
  
      return list;
    }
  }