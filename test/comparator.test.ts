import 'jest';

import { counter, init, increment, CounterAction } from './helpers/counter';
import { undoable } from '../src/undoable.reducer';
import { UndoableState } from '../src/interfaces/public';

describe('comparator', () => {

  const reducer = undoable(counter).reducer
  type UndoableCounter = UndoableState<number, CounterAction>

  it('should not add an action to history if it does not change state', () => {

    const initialState: UndoableCounter = {
      past    : [ init(), increment() ],
      present : 1,
      future  : [ ]
    }

    // init will not change state
    const action = init()

    const actualState = reducer(initialState, action)
    expect(actualState).toEqual(initialState)

  })

  it('should add no action if comparator is defined this way', () => {

    // comparator which always returns that states are equal,
    // so no action should be added to the history
    const reducerWithComparator = undoable(counter, init(), (s1, s2) => true).reducer

    const initialState: UndoableCounter = {
      past    : [ init() ],
      present : 0,
      future  : [ ]
    }

    const action = increment()

    const actualState = reducerWithComparator(initialState, action)
    expect(actualState).toEqual(initialState)

  })

  it('should add every action if comparator is defined this way', () => {

    // comparator which always returns that states are non equal,
    // so every action should be added to the history
    const reducerWithComparator = undoable(counter, init(), (s1, s2) => false).reducer

    const initialState: UndoableCounter = {
      past    : [ init() ],
      present : 0,
      future  : [ ]
    }

    const action = init()

    const expectedState: UndoableCounter = {
      past    : [ init(), init() ],
      present : 0,
      future  : [ ]
    }

    const actualState = reducerWithComparator(initialState, action)
    expect(actualState).toEqual(expectedState)

  })

}) // ==== comparator ====