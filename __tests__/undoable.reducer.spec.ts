import { undoable } from '../src/undoable.reducer'
import { UndoAction, RedoAction, UndoableTypes, undo, redo, group } from '../src/undoable.action'
import { Action } from '../src/interfaces/public'

enum Count {
  INCREMENT = 'INCREMENT',
  DECREMENT = 'DECREMENT',
  INIT      = 'INIT'
}

interface Init extends Action {
  type: Count.INIT
}

interface Increment extends Action {
  type: Count.INCREMENT
}

interface Decrement extends Action {
  type: Count.DECREMENT
}

const increment = (): Increment => {
  return { type: Count.INCREMENT }
}

const decrement = (): Decrement => {
  return { type: Count.DECREMENT }
}

const init = (): Init => {
  return { type: Count.INIT }
}

type CounterAction = Init | Increment | Decrement

const counter = (state = 0, action: CounterAction) => {

  switch (action.type) {

    case Count.INCREMENT:
      return state + 1

    case Count.DECREMENT:
      return state - 1

    default:
      return state

  }

}

const reducer = undoable(counter, init())

describe('The undoable.reducer', () => {

  describe('initial state', () => {

    it('should produce an initial state on undefined action type', () => {

      const initialState = undefined

      const initAction = init()

      // 0
      const expectedState = {
        past    : [ initAction ],
        present : 0,
        future  : [ ]
      }

      const actualState = reducer(initialState, initAction)
      expect(actualState).toEqual(expectedState)

    })

  }) // ==== initial state ====


  describe('forward', () => {

    it('should call the given reducer', () => {

      const initialState = undefined

      const incrementAction = increment()

      // 0, 1
      const expectedState = {
        past    : [ init(), incrementAction ],
        present : 1,
        future  : [ ]
      }

      const actualState = reducer(initialState, incrementAction)
      expect(actualState).toEqual(expectedState)

    })

    it('should call the given reducer', () => {

      const initialState = undefined
      const decrementAction = decrement()

      // 0, -1
      const expectedState = {
        past    : [ init(), decrementAction ],
        present : -1,
        future  : [ ]
      }
      
      const actualState = reducer(initialState, decrementAction)
      expect(actualState).toEqual(expectedState)

    })

  }) // ==== forward ====


  describe('undo', () => {

    it('should undo to the previous state', () => {

      // 0, 1, 2
      const initialState = {
        past    : [ init(), increment(), increment() ],
        present : 2,
        future  : [ ]
      }

      const undoAction = undo()

      // 0, 1, 2, 1
      const expectedState = {
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

      // 0, 1, ... , 7, 8, 7
      const initialState = {
        past    : [ init(), increment(), increment(), increment(), increment(), increment(), increment(), increment() ],
        present : 7,
        future  : [ increment() ]
      }
      
      const undoAction = undo(4)

      // 0, 1, ... , 7, 8, 7, 3
      const expectedState = {
        past    : [ init(), increment(), increment(), increment() ],
        present : 3,
        future  : [ increment(), increment(), increment(), increment(), increment() ]
      }

      const actualState = reducer(initialState, undoAction)
      expect(actualState).toEqual(expectedState)

    })

    it('should undo multiple greater than past', () => {
      
      // 0, 1, ... , 7, 8, 7
      const initialState = {
        past    : [ init(), increment(), increment(), increment(), increment(), increment(), increment(), increment() ],
        present : 7,
        future  : [ increment() ]
      }
      
      const undoAction = undo(100)

      // 0, 1, ... , 7, 8, 0
      const expectedState = {
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

      // 0, 1, 2, 3, 1
      const initialState = {
        past    : [ init(), increment() ],
        present : 1,
        future  : [ decrement(), increment() ]
      }

      const action = redo()

      // 0, 1, 2, 3, 1, 2
      const expectedState = {
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

      // 0, 1, 2, 3, 4, 5, 6, 7, 1
      const initialState = {
        past    : [ init(), increment() ],
        present : 1,
        future  : [ increment(), increment(), increment(), increment(), increment(), increment() ]
      }
      
      const action = redo(4)

      // 0, 1, 2, 3, 4, 5, 6, 7, 1
      const expectedState = {
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

      // 0, 1, 2, 3
      const initialState = {
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

      const initialState = {
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

      const initialState = {
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


  describe('forward actions', () => {

    it('should forward actions to a correct state', () => {

      const initialState = {
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
  }) // ==== forward actions ====


  describe('group actions', () => {

    it('should undo grouped actions', () => {

      const initialState = {
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
      
      const initialState = {
        past    : [ init() ],
        present : 0,
        future  : [ [ increment(), increment(), decrement() ] ]
      }

      const action = redo()

      const expectedState = {
        past    : [ init(), [ increment(), increment(), decrement() ] ],
        present : 1,
        future  : [ ]
      }

      const actualState = reducer(initialState, action)
      expect(actualState).toEqual(expectedState)

    })

  }) // ==== group actions ====


  describe('comparator', () => {

    it('default comparator should not add action to history if it does not change state', () => {

      const initialState = {
        past    : [ init(), increment() ],
        present : 1,
        future  : [ ]
      }

      // init will not change state
      const action = init()

      const actualState = reducer(initialState, action)
      expect(actualState).toEqual(initialState)

    })

    it('provided comparator should be used', () => {

      // comparator which always returns that states are equal,
      // so no action should be added to the history
      const reducerWithComparator = undoable(counter, init(), (s1, s2) => true)
      
      const initialState = {
        past    : [ init() ],
        present : 0,
        future  : [ ]
      }

      // init will not change state
      const action = increment()

      const actualState = reducerWithComparator(initialState, action)
      expect(actualState).toEqual(initialState)

    })
  
  }) // ==== comparator ====

})
