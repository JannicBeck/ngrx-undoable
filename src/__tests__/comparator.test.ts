import 'jest';

import { counter, init, increment, CounterAction } from './helpers/counter';
import { undoable } from '../undoable.reducer';
import { UndoableState } from '../interfaces/public';

const reducer = undoable(counter).reducer

describe('comparator', () => {
  
  it('should not add an action to history if it does not change state', () => {

    const initialState: UndoableState<number, CounterAction> = {
      past    : [ init(), increment() ],
      present : 1,
      future  : [ ]
    }

    // init will not change state
    const action = init()

    const actualState = reducer(initialState, action)
    expect(actualState).toEqual(initialState)

  })

  it('should use the provided comparator', () => {

    // comparator which always returns that states are equal,
    // so no action should be added to the history
    const reducerWithComparator = undoable(counter, init(), (s1, s2) => true).reducer

    const initialState: UndoableState<number, CounterAction> = {
      past    : [ init() ],
      present : 0,
      future  : [ ]
    }

    const action = increment()

    const actualState = reducerWithComparator(initialState, action)
    expect(actualState).toEqual(initialState)

  })

  it('should use the provided comparator', () => {

    // comparator which always returns that states are non equal,
    // so every action should be added to the history
    const reducerWithComparator = undoable(counter, init(), (s1, s2) => false).reducer

    const initialState: UndoableState<number, CounterAction> = {
      past    : [ init(), init() ],
      present : 0,
      future  : [ ]
    }

    const action = init()

    const actualState = reducerWithComparator(initialState, action)
    expect(actualState).toEqual(initialState)

  })

}) // ==== comparator ====