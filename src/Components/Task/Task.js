import { formatDistanceToNow } from 'date-fns';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import './Task.css';

export default class Task extends Component {
  static defaultProps = {
    description: 'text',
    created: new Date(),
    onDeleted: () => {},
    onToggleCompleted: () => {},
    completed: true
  };

  static propTypes = {
    description: PropTypes.node,
    created: PropTypes.instanceOf(Date),
    onDeleted: PropTypes.func,
    onToggleCompleted: PropTypes.func,
    completed: PropTypes.bool
  };

  state = {
    remainingSeconds: this.props.other.totalSeconds,
    isTimerRunning: false
  };

  timerInterval = null;

  componentDidMount() {
    if (this.props.other.totalSeconds > 0) {
      this.startTimer();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.other.totalSeconds !== prevProps.other.totalSeconds) {
      clearInterval(this.timerInterval);
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState(
        {
          remainingSeconds: this.props.other.totalSeconds,
          isTimerRunning: false
        },
        () => {
          if (this.props.other.totalSeconds > 0) {
            this.startTimer();
          }
        }
      );
    }
  }

  componentWillUnmount() {
    clearInterval(this.timerInterval);
  }

  startTimer = () => {
    this.setState({ isTimerRunning: true }, () => {
      this.timerInterval = setInterval(() => {
        this.setState((prevState) => {
          if (prevState.remainingSeconds <= 0) {
            clearInterval(this.timerInterval);
            return { remainingSeconds: 0, isTimerRunning: false };
          }
          return { remainingSeconds: prevState.remainingSeconds - 1 };
        });
      }, 1000);
    });
  };

  stopTimer = () => {
    clearInterval(this.timerInterval);
    this.setState({ isTimerRunning: false });
  };

  render() {
    const {
      other: { description, created, completed },
      onDeleted,
      onToggleCompleted
    } = this.props;

    const { remainingSeconds, isTimerRunning } = this.state;

    const minutes = Math.floor(remainingSeconds / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (remainingSeconds % 60).toString().padStart(2, '0');

    const timeAgo = formatDistanceToNow(created, { includeSeconds: true, addSuffix: true });

    return (
      <li className={completed ? 'completed' : ''}>
        <div className="view">
          <input
            className="toggle"
            type="checkbox"
            checked={completed}
            onChange={onToggleCompleted}
          />
          <label>
            <span className="title">{description}</span>
            <span className="description">
              <button
                className="icon icon-play"
                onClick={this.startTimer}
                disabled={isTimerRunning}
              />
              <button
                className="icon icon-pause"
                onClick={this.stopTimer}
                disabled={!isTimerRunning || remainingSeconds <= 0}
              />
              {minutes}:{seconds}
            </span>
            <span className="description">created {timeAgo}</span>
          </label>
          <button className="icon icon-edit" />
          <button className="icon icon-destroy" onClick={onDeleted} />
        </div>
      </li>
    );
  }
}
