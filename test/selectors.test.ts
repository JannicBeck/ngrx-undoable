import 'jest'

import { counter, CounterAction, init, increment, decrement } from './helpers/counter';
import { undoable } from '../src/undoable.reducer';
import { UndoableState } from '../src/interfaces/public';

describe('The undoable.selectors', () => {

  const undoableCounter = undoable(counter)
  const { reducer, selectors } = undoableCounter
  type UndoableCounter = UndoableState<number, CounterAction>
  
  it('should select the present state', () => {

    const state: UndoableCounter = {
      past    : [ init(), increment(), increment() ],
      present : 2,
      future  : [ ]
    }

    expect(selectors.getPresentState(state)).toEqual(2)

  })

  it('should select the past states', () => {

    const state: UndoableCounter = {
      past    : [ init(), increment(), decrement() ],
      present : 0,
      future  : [ ]
    }

    expect(selectors.getPastStates(state)).toEqual([ 0, 1 ])

  })

  it('should select the present action', () => {

    const state: UndoableCounter = {
      past    : [ init(), increment(), decrement() ],
      present : 0,
      future  : [ ]
    }

    expect(selectors.getPresentAction(state)).toEqual(decrement())

  })

  it('should select the past actions', () => {

    const state: UndoableCounter = {
      past    : [ init(), increment(), decrement() ],
      present : 0,
      future  : [ ]
    }

    expect(selectors.getPastActions(state)).toEqual([ init(), increment(), decrement() ])

  })

  it('should select the future states', () => {

    const state: UndoableCounter = {
      past    : [ init() ],
      present : 0,
      future  : [ increment(), increment(), decrement() ]
    }

    expect(selectors.getFutureStates(state)).toEqual([ 1, 2, 1 ])

  })

  it('should select the future actions', () => {

    const state: UndoableCounter = {
      past    : [ init() ],
      present : 0,
      future  : [ increment(), increment(), decrement() ]
    }

    expect(selectors.getFutureActions(state)).toEqual([ increment(), increment(), decrement() ])

  })

})
