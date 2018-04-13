import React from 'react'
import ReactDOM from 'react-dom'
import { createStore } from 'redux'
import { UndoableTypes } from 'ngrx-undoable'

import Counter from './components/Counter'
import { reducer } from './reducers'

const store = createStore(
  reducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)
const rootEl = document.getElementById('root')

const render = () => ReactDOM.render(
  <Counter
    value={store.getState()}
    onIncrement={() => store.dispatch({ type: 'INCREMENT' })}
    onDecrement={() => store.dispatch({ type: 'DECREMENT' })}
    onUndo={() => store.dispatch({ type: UndoableTypes.UNDO })}
    onRedo={() => store.dispatch({ type: UndoableTypes.REDO })}
  />,
  rootEl
)

render()
store.subscribe(render)
