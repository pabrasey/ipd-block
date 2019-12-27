import React, { Component } from "react";
import { Table, EthAddress, Field } from 'rimble-ui';

class Row extends React.Component {
    render() {
      return (
        <tr>
          <td><EthAddress address = { this.props.work.worker } /></td>
          <td>{ this.props.work.hours }</td>
        </tr>
      );
    }
  }

class WorkedHoursTable extends Component {

    render() {
  
      const worked_hours = this.props.worked_hours;

      const rows = [];

      // balances.sort((a, b) => (a.balance < b.balance) ? 1 : -1);
      worked_hours.forEach((work, index) => {
        rows.push( <Row work = { work } key = { index } /> );
      });

      return (
        <Table m={50} width={0.9}>
          <thead>
            <tr>
              <th>Worker</th>
              <th>Worked hours</th>
            </tr>
          </thead>
          <tbody>
              {rows}
          </tbody>
        </Table>      
      )      
    }
  }
  
  export default WorkedHoursTable;