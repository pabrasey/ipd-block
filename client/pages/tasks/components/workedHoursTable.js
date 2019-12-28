import React, { Component } from "react";
import { Table, EthAddress, Field } from 'rimble-ui';

class Row extends React.Component {
    render() {
      return (
        <tr>
          <td><EthAddress address = { this.props.work.worker } /></td>
          <td><strong fontSize={15}>{ this.props.work.hours }</strong></td>
          <td><strong fontSize={15}>{ this.props.work.hours * this.props.salary }</strong></td>
        </tr>
      );
    }
  }

class WorkedHoursTable extends Component {

    render() {
  
      const worked_hours = this.props.worked_hours;
      const salary = this.props.salary;

      const rows = [];

      // balances.sort((a, b) => (a.balance < b.balance) ? 1 : -1);
      let total_hours = 0;
      worked_hours.forEach((work, index) => {
        rows.push( <Row work = { work } salary = { salary } key = { index } /> );
        total_hours += work.hours;
      });

      return (
        <Table m={50} width={0.9}>
          <thead>
            <tr>
              <th>Worker</th>
              <th>Worked hours</th>
              <th>Salary (ether)</th>
            </tr>
          </thead>
          <tbody>
            {rows}
            <tr>
              <td>Total:</td>
              <td>{total_hours}</td>
              <td>{total_hours * salary}</td>
            </tr>
          </tbody>
        </Table>      
      )      
    }
  }
  
  export default WorkedHoursTable;