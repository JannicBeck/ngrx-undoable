import 'jest';

import { undoable } from '../src/undoable.reducer';
import { UndoableState } from '../src/interfaces/public';

import {
  undo,
  redo,
  group
} from '../src/undoable.action';

import {
  counter,
  init,
  increment,
  decrement,
  CounterAction
} from './helpers/counter';

describe('The undoable.reducer', () => {
  
  const reducer = undoable(counter, init()).reducer
  type UndoableCounter = UndoableState<number, CounterAction>

  describe('initial state', () => {

    it('should produce an initial state on undefined action type', () => {

      const initialState: UndoableCounter = undefined

      const initAction = init()

      const expectedState: UndoableCounter = {
        past    : [ initAction ],
        present : 0,
        future  : [ ]
      }

      const actualState = reducer(initialState, initAction)
      expect(actualState).toEqual(expectedState)

    })

  }) // ==== initial state ====



  describe('forwarding actions', () => {

    it('should call the given reducer', () => {

      const initialState: UndoableCounter = undefined

      const incrementAction = increment()

      const expectedState: UndoableCounter = {
        past    : [ init(), incrementAction ],
        present : 1,
        future  : [ ]
      }

      const actualState = reducer(initialState, incrementAction)
      expect(actualState).toEqual(expectedState)

    })

    it('should call the given reducer', () => {

      const initialState: UndoableCounter = undefined
      const decrementAction = decrement()

      const expectedState: UndoableCounter = {
        past    : [ init(), decrementAction ],
        present : -1,
        future  : [ ]
      }

      const actualState = reducer(initialState, decrementAction)
      expect(actualState).toEqual(expectedState)

    })

    it('should wipe the future when an action is forwarded', () => {

      const initialState: UndoableCounter = {
        past    : [ init(), increment() ],
        present : 1,
        future  : [ increment(), increment(), increment() ]
      }

      const actualState1 = reducer(initialState, increment())

      expect(actualState1).toEqual({
        past    : [ init(), increment(), increment() ],
        present : 2,
        future  : [ ]
      })

      const actualState2 = reducer(actualState1, decrement())

      expect(actualState2).toEqual({
        past    : [ init(), increment(), increment(), decrement() ],
        present : 1,
        future  : [ ]
      })

    })

  }) // ==== forwarding actions ====



  describe('undo', () => {

    it('should undo to the previous state', () => {

      const initialState: UndoableCounter = {
        past    : [ init(), increment(), increment() ],
        present : 2,
        future  : [ ]
      }

      const undoAction = undo()

      const expectedState: UndoableCounter = {
        past    : [ init(), increment() ],
        present : 1,
        future  : [ increment() ]
      }

      const actualState = reducer(initialState, undoAction)
      expect(actualState).toEqual(expectedState)
    })

  }) // ==== undo ====



  describe('undo multiple', () => {

    it('should undo multiple to a past state', () => {

      const initialState: UndoableCounter = {
        past    : [ init(), increment(), increment(), increment(), increment(), increment(), increment(), increment() ],
        present : 7,
        future  : [ increment() ]
      }

      const undoAction = undo(4)

      const expectedState: UndoableCounter = {
        past    : [ init(), increment(), increment(), increment() ],
        present : 3,
        future  : [ increment(), increment(), increment(), increment(), increment() ]
      }

      const actualState = reducer(initialState, undoAction)
      expect(actualState).toEqual(expectedState)

    })

    it('should undo multiple greater than past', () => {

      const initialState: UndoableCounter = {
        past    : [ init(), increment(), increment(), increment(), increment(), increment(), increment(), increment() ],
        present : 7,
        future  : [ increment() ]
      }

      const undoAction = undo(100)

      const expectedState: UndoableCounter = {
        past    : [ init() ],
        present : 0,
        future  : [ increment(), increment(), increment(), increment(), increment(), increment(), increment(), increment() ]
      }

      const actualState = reducer(initialState, undoAction)
      expect(actualState).toEqual(expectedState)

    })

  }) // ==== undo multiple ====



  describe('redo', () => {

    it('should redo to the future state', () => {

      const initialState: UndoableCounter = {
        past    : [ init(), increment() ],
        present : 1,
        future  : [ increment(), decrement() ]
      }

      const action = redo()

      const expectedState: UndoableCounter = {
        past    : [ init(), increment(), increment() ],
        present : 2,
        future  : [ decrement() ]
      }

      const actualState = reducer(initialState, action)
      expect(actualState).toEqual(expectedState)

    })

  }) // ==== redo ====



  describe('redo multiple', () => {

    it('should redo multiple to a future state', () => {

      const initialState: UndoableCounter = {
        past    : [ init(), increment() ],
        present : 1,
        future  : [ increment(), increment(), increment(), increment(), increment(), increment() ]
      }

      const action = redo(4)

      const expectedState: UndoableCounter = {
        past    : [ init(), increment(), increment(), increment(), increment(), increment() ],
        present : 5,
        future  : [ increment(), increment() ]
      }

      const actualState = reducer(initialState, action)
      expect(actualState).toEqual(expectedState)
    })

  }) // ==== redo multiple ====



  describe('undo sequence', () => {

    it('should undo a sequence of states to a previous state', () => {

      const initialState: UndoableCounter = {
        past    : [ init(), increment(), increment(), increment() ],
        present : 3,
        future  : [ ]
      }

      const actualState1 = reducer(initialState, undo())

      expect(actualState1).toEqual({
        past    : [ init(), increment(), increment() ],
        present : 2,
        future  : [ increment() ]
      })

      const actualState2 = reducer(actualState1, undo())
      expect(actualState2).toEqual({
        past    : [ init(), increment() ],
        present : 1,
        future  : [ increment(), increment() ]
      })

      const actualState3 = reducer(actualState2, undo())
      expect(actualState3).toEqual({
        past    : [ init() ],
        present : 0,
        future  : [ increment(), increment(), increment() ]
      })

      const actualState4 = reducer(actualState3, undo())
      expect(actualState4).toEqual({
        past    : [ init() ], // nothing to undo
        present : 0,
        future  : [ increment(), increment(), increment() ]
      })

    })

  }) // ==== undo sequence ====



  describe('redo sequence', () => {

    it('should redo a sequence of states to a future state', () => {

      const initialState: UndoableCounter = {
        past    : [ init() ],
        present : 0,
        future  : [ increment(), increment(), increment() ]
      }

      const actualState1 = reducer(initialState, redo())
      expect(actualState1).toEqual({
        past    : [ init(), increment() ],
        present : 1,
        future  : [ increment(), increment() ]
      })

      const actualState2 = reducer(actualState1, redo())
      expect(actualState2).toEqual({
        past    : [ init(), increment(), increment() ],
        present : 2,
        future  : [ increment() ]
      })

      const actualState3 = reducer(actualState2, redo())
      expect(actualState3).toEqual({
        past    : [ init(), increment(), increment(), increment() ],
        present : 3,
        future  : [ ] // nothing to redo
      })

      const actualState4 = reducer(actualState3, redo())
      expect(actualState4).toEqual({
        past    : [ init(), increment(), increment(), increment() ],
        present : 3,
        future  : [ ]
      })

    })

  }) // ==== redo sequence ====



  describe('undo/redo sequence', () => {

    it('should undo and redo a sequence of states to a correct state', () => {

      const initialState: UndoableCounter = {
        past    : [ init() ],
        present : 0,
        future  : [ increment(), increment(), increment()]
      }

      const actualState1 = reducer(initialState, redo())
      expect(actualState1).toEqual({
        past    : [ init(), increment() ],
        present : 1,
        future  : [ increment(), increment() ]
      })

      const actualState2 = reducer(actualState1, redo())
      expect(actualState2).toEqual({
        past    : [ init(), increment(), increment() ],
        present : 2,
        future  : [ increment() ]
      })

      const actualState3 = reducer(actualState2, undo())
      expect(actualState3).toEqual(actualState1)

      const actualState4 = reducer(actualState3, redo())
      expect(actualState4).toEqual(actualState2)

    })

  }) // ==== undo/redo sequence ====



  describe('group actions', () => {
    
    it('should add grouped actions', () => {

      const initialState: UndoableCounter = {
        past    : [ init() ],
        present : 0,
        future  : [ ]
      }

      const groupAction = group(increment(), increment())

      const actualState = reducer(initialState, groupAction)

      expect(actualState).toEqual({
        past    : [ init(), [ increment(), increment() ] ],
        present : 2,
        future  : [  ]
      })

    })

    it('should undo grouped actions', () => {

      const initialState: UndoableCounter = {
        past    : [ init() ],
        present : 0,
        future  : [ ]
      }

      const groupAction = group(increment(), increment())

      const actualState1 = reducer(initialState, groupAction)

      expect(actualState1).toEqual({
        past    : [ init(), [ increment(), increment() ] ],
        present : 2,
        future  : [ ]
      })

      const actualState2 = reducer(actualState1, undo())

      expect(actualState2).toEqual({
        past    : [ init() ],
        present : 0,
        future  : [ [ increment(), increment() ] ]
      })

    })

    it('should redo grouped actions', () => {

      const initialState: UndoableCounter = {
        past    : [ init() ],
        present : 0,
        future  : [ [ increment(), increment(), decrement() ] ]
      }

      const action = redo()

      const expectedState: UndoableCounter = {
        past    : [ init(), [ increment(), increment(), decrement() ] ],
        present : 1,
        future  : [ ]
      }

      const actualState = reducer(initialState, action)
      expect(actualState).toEqual(expectedState)

    })

  }) // ==== group actions ====


})
