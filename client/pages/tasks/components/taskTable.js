import React, { Component } from "react";
import { Table, Link } from 'rimble-ui';
import { AddressList } from '../../../components/ethereum';

const task_state = { 0: 'created', 1: 'accepted', 2: 'completed', 3: 'validated' };

class TaskRow extends React.Component {
  render() {
    const task = this.props.task;

    return (
      <tr>
        <td>{ task.id }</td>
        <td>

          <Link href={"/tasks/".concat(task.id)}>
            { task.title }
          </Link>
        </td>
        <td>{task_state[task.state]}</td>
        <td><AddressList addresses = { task.validators } /></td>
        <td><AddressList addresses = { task.workers } /></td>
      </tr>
    );
  }
}

class TaskTable extends Component {

  render() {

    const rows = [];
    const tasks = this.props.tasks;

    console.log('tasks: ', tasks);

    tasks.forEach((task) => {
      rows.push( <TaskRow task = { task } key = { task.id } /> );
    });

    return (
      <Table m={50} width={0.9}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>State</th>
            <th>Validators</th>
            <th>Workers</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>      
    )      
  }
}

export default TaskTable;