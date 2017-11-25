import React, { Component } from 'react'
import PropTypes from 'prop-types'

class Counter extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { value, onIncrement, onDecrement, onGroupIncrement, onGroupDecrement, onExecuteGroup } = this.props
    return (
      <p>
        Clicked: {value.present} times
        {' '}
        <button onClick={onIncrement}>
          +
        </button>
        {' '}
        <button onClick={onDecrement}>
          -
        </button>
        {' '}
        <button onClick={onGroupIncrement}>
          Group increment
        </button>
        {' '}
        <button onClick={onGroupDecrement}>
          Group decrement
        </button>
        {' '}
        <button onClick={onExecuteGroup}>
          Execute Group
        </button>
      </p>
    )
  }
}

Counter.propTypes = {
  value: PropTypes.object.isRequired,
  onIncrement: PropTypes.func.isRequired,
  onDecrement: PropTypes.func.isRequired,
  onGroupIncrement: PropTypes.func.isRequired,
  onGroupDecrement: PropTypes.func.isRequired,
  onExecuteGroup: PropTypes.func.isRequired
}

export default Counter
