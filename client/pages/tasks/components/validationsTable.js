import React, { Component } from "react";
import { Table, EthAddress, Field } from 'rimble-ui';

class Row extends React.Component {
    render() {
      return (
        <tr>
          <td><EthAddress address = { this.props.validation.validator } /></td>
          <td>{ this.props.validation.ppc }</td>
          <td>{ this.props.validation.Qrating }</td>
        </tr>
      );
    }
  }

class ValidationsTable extends Component {

    render() {
  
      const validations = this.props.validations;

      const rows = [];

      // balances.sort((a, b) => (a.balance < b.balance) ? 1 : -1);
      let total_ppc = 0;
      let total_Qrating = 0;
      let n = validations.length;

      validations.forEach((validation, index) => {
        rows.push( <Row validation = { validation } key = { index } /> );
        total_ppc += validation.ppc;
        total_Qrating += validation.Qrating;
      });

      return (
        <Table m={50} width={0.9}>
          <thead>
            <tr>
              <th>Validator</th>
              <th>PPC</th>
              <th>Qrating</th>
            </tr>
          </thead>
          <tbody>
            {rows}
            <tr>
              <td><strong>Average:</strong></td>
              <td><strong>{total_ppc / n}</strong></td>
              <td><strong>{Math.floor(total_Qrating / n)}</strong></td>
            </tr>
          </tbody>
        </Table>      
      )      
    }
  }
  
  export default ValidationsTable;