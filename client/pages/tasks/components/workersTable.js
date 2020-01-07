import React, { Component } from "react";
import { Table, EthAddress, Field } from 'rimble-ui';

class Row extends React.Component {
    render() {
      return (
        <tr>
          <td><EthAddress address = { this.props.work.worker } /></td>
          <td>{ this.props.work.hours }</td>
          <td>{ this.props.work.hours * this.props.hourly_rate }</td>
          <td>{ this.props.work.ppc }</td>
        </tr>
      );
    }
  }

class WorkersTable extends Component {

    render() {
  
      const workers_info = this.props.workers_info;
      const hourly_rate = this.props.hourly_rate;

      const rows = [];

      // balances.sort((a, b) => (a.balance < b.balance) ? 1 : -1);
      let total_hours = 0;
      workers_info.forEach((work, index) => {
        rows.push( <Row work = { work } hourly_rate = { hourly_rate } key = { index } /> );
        total_hours += work.hours;
      });

      return (
        <Table m={50} width={0.9}>
          <thead>
            <tr>
              <th>Worker</th>
              <th>Worked hours</th>
              <th>Salary (ether)</th>
              <th>Proposed PPC</th>
            </tr>
          </thead>
          <tbody>
            {rows}
            <tr>
              <td><strong>Total:</strong></td>
              <td><strong>{total_hours}</strong></td>
              <td><strong>{total_hours * hourly_rate}</strong></td>
              <td><strong>-</strong></td>
            </tr>
          </tbody>
        </Table>      
      )      
    }
  }
  
  export default WorkersTable;