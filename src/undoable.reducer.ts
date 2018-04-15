import {
  DoNStatesExist,
  CalculateState,
  TravelNStates,
  CreateTravelOne,
  UpdateHistory,
  CreateSelectors,
  CreateUndoableReducer
} from './interfaces/internal';

import {
  Undoable,
  Action,
  Reducer,
  UndoableReducer,
  UndoableState,
  UndoableMap,
  Setters,
  Limit
} from './interfaces/public';

import { UndoableTypes, UndoableAction, GroupAction, UndoAction, RedoAction } from './undoable.action';


/**
 * Checks whether the passed value is an integer.
 * 
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
 */
const isInteger = Number.isInteger || function (value) {
  return typeof value === "number" && 
    isFinite(value) && 
    Math.floor(value) === value
}


// when grouping actions we will get multidimensional arrays
// so this helper is used to flatten the history
const flatten = <T> (x: (T | T[])[]) => [].concat(...x) as T[]


// since the oldest past is the init action we never want to remove it from the past
const doNPastStatesExist: DoNStatesExist = (past, nStates) => past.length > nStates
const doNFutureStatesExist: DoNStatesExist = (future, nStates) => future.length >= nStates


// actions can be an array of arrays because of grouped actions, so we flatten it first
const calculateState: CalculateState = (reducer, actions, state) => 
  flatten(actions).reduce(reducer, state)



const travelNStates: TravelNStates = (state, nStates, travelOne) => {

  if (!isInteger(nStates)) {
    throw new Error(`The payload has to be an integer but instead received: ${nStates}`)
  }

  if (nStates === 0) return state

  return travelNStates(travelOne(state, nStates), --nStates, travelOne)

}



const createUndo: CreateTravelOne = reducer => (state, nStates = 1) => {

  if (!doNPastStatesExist(state.past, nStates))
    return state

  const latestPast = state.past[state.past.length - 1]
  const futureWithLatestPast = [ latestPast, ...state.future ]
  const pastWithoutLatest = state.past.slice(0, -1)

  return {
    past    : pastWithoutLatest,
    present : calculateState(reducer, pastWithoutLatest),
    future  : futureWithLatestPast
  }

}



const createRedo: CreateTravelOne = reducer => (state, nStates = 1) => {

  if (!doNFutureStatesExist(state.future, nStates))
    return state

  const [ latestFuture, ...futureWithoutLatest ] = state.future
  const pastWithLatestFuture = [ ...state.past, latestFuture ]

  return {
    past    : pastWithLatestFuture,
    present : calculateState(reducer, [ latestFuture ], state.present),
    future  : futureWithoutLatest 
  }

}



const updateHistory: UpdateHistory = (state, newPresent, action, comparator) => {

  if (comparator(state.present, newPresent))
    return state

  const newPast = [ ...state.past, action ]

  return {
    past    : newPast,
    present : newPresent,
    future  : [ ]
  }

}


const getPastActions   = <S, A extends Action>(state: UndoableState<S, A>) => state.past
const getPresentAction = <S, A extends Action>(state: UndoableState<S, A>) => state.past[0]
const getFutureActions = <S, A extends Action>(state: UndoableState<S, A>) => state.future
const getPresentState  = <S, A extends Action>(state: UndoableState<S, A>) => state.present

const getPastActionsFlattened   = <S, A extends Action>(state: UndoableState<S, A>) => flatten(state.past)
const getPresentActionFlattened = <S, A extends Action>(state: UndoableState<S, A>) => getPastActionsFlattened(state)[0]
const getFutureActionsFlattened = <S, A extends Action>(state: UndoableState<S, A>) => flatten(state.future)

/**
 * Creates the getFutureStates selector.
 * 
 * The selector is mapping the future actions to future states.
 * It uses `reduce` instead of `map`, because this way we can reuse the
 * previous future state to calculate the next future state.
 * 
 * @param reducer The Reducer that is used to replay actions from the future 
 */
const createGetFutureStates = <S, A extends Action>(reducer: Reducer<S, A>) => (state: UndoableState<S, A>): S[] =>
  getFutureActions(state)
    .reduce(
      (states, a, i) =>
        Array.isArray(a) // check if action is grouped
          ? [ ...states, a.reduce(reducer, states[i]) ]
          : [ ...states, reducer(states[i], a) ]
      , [ getPresentState(state) ] as S[]
    ).slice(1) // We start with present to calculate future states, but present state should not part be of future so we slice it off


/**
 * Creates the getPastStates selector.
 * 
 * The selector is mapping the past actions to past states.
 * It uses `reduce` instead of `map`, because this way we can reuse the
 * previous past state to calculate the next past state.
 * 
 * @param reducer The Reducer that is used to replay actions from the past 
 */
const createGetPastStates = <S, A extends Action>(reducer: Reducer<S, A>) => (state: UndoableState<S, A>): S[] =>
  getPastActions(state).reduce(
      (states, a, i) =>
        Array.isArray(a) // check if action is grouped
          ? [ ...states, a.reduce(reducer, states[i - 1]) ]
          : [ ...states, reducer(states[i - 1], a) ]
      , [ ] as S[]
    ).slice(0, -1) // Slice the last state since its the present


export const createSelectors: CreateSelectors = reducer => {

  return {
    getPresentState,
    getPastStates   : createGetPastStates(reducer),
    getFutureStates : createGetFutureStates(reducer), 
    getPastActions  : getPastActionsFlattened,
    getPresentAction: getPresentActionFlattened,
    getFutureActions: getFutureActionsFlattened
  }

}

type LimitState<S, A extends Action> = UndoableState<S, A> & { limitState: S }

const limitReducer = <S, A extends Action>(undoable: UndoableMap<S, A>, limit: Limit) => {

  const initUndoableReducer = "ngrx-undoable/INIT_UNDOABLE"

  const undoableReducer = undoable.reducer
  const setters = undoable.setters
  const selectors = undoable.selectors
  const initialUndoableState = undoable.reducer(undefined, { type: initUndoableReducer } as any)

  const initialState: LimitState<S, A> = {
    ...initialUndoableState,
    limitState: getPresentState(initialUndoableState)
  }

  const limitPast = (state: LimitState<S, A>, newState: LimitState<S, A>) => {

    const pastActions = getPastActions(state)

    if (pastActions.length > limit.past) {

      const newPast = pastActions.slice(pastActions.length - limit.past)
      const limitState = selectors.getPastStates(newState)[pastActions.length - limit.past]

      return {
        ...setters.setPastActions(newState, newPast, getPresentState(newState)),
        limitState
      }

    }

    return newState

  }

  const limitFuture = (state: LimitState<S, A>, newState: LimitState<S, A>) => {

    const futureActions = getFutureActions(state)

    if (futureActions.length > limit.future)
      return setters.setFutureActions(newState, futureActions.slice(0, futureActions.length - limit.future))

  }

  return (state = initialState, action: UndoableAction | GroupAction<A> | A) => {

    const newState = undoableReducer(state, action as UndoableAction | A) as LimitState<S, A>

    if (isUndoAction(action))
      return limitFuture(state, newState)

    if (isRedoAction(action))
      return limitPast(state, newState)

    if (isGroupAction(action))
      return limitPast(state, newState)

    return limitPast(state, newState)

  }

}

export const isGroupAction = <A extends Action>(action: A | UndoableAction | GroupAction<A>): action is GroupAction<A> => action.type === UndoableTypes.GROUP

export const groupReducer = <S, A extends Action>(undoable: UndoableMap<S, A>, reducer: Reducer<S, A>) => {

  const undoableReducer = undoable.reducer
  const setters = undoable.setters
  const selectors = undoable.selectors
  const initialState = undoable.reducer(undefined, {} as any)

  return (state = initialState, action: UndoableAction | A | GroupAction<A>) => {

    if (isGroupAction(action)) {

      if (!Array.isArray(action.payload))
        throw new Error(`The payload has to be an array of actions but instead received: ${action.payload}`)

      const newPast = [ ...selectors.getPastActions(state), action.payload ]
      const newPresent = action.payload.reduce(reducer, state.present)

      return setters.setPastActions(state, newPast, newPresent)

    }

    return undoableReducer(state, action)

  }
 
}


export const createSetters = <S, A extends Action>(reducer: Reducer<S, A>): Setters<S, A> => ({

  setPastActions: (state: UndoableState<S, A> , past: (A | A[])[], present: S): UndoableState<S, A> => {

    if (!present) {
      present = calculateState(reducer, past)
    }

    return {
      ...state,
      past,
      present
    }

  },

  setFutureActions: (state: UndoableState<S, A>, future: (A | A[])[]): UndoableState<S, A> => ({
    ...state,
    future 
  })

})

const isUndoAction = <A extends Action>(action: A | UndoableAction): action is UndoAction => action.type === UndoableTypes.UNDO
const isRedoAction = <A extends Action>(action: A | UndoableAction): action is RedoAction => action.type === UndoableTypes.REDO

const createUndoableReducer: CreateUndoableReducer = (reducer, initAction, comparator) => {

  const initialState = {
    past    : [ initAction ],
    present : reducer(undefined, initAction),
    future  : [ ] as any
  }

  const undo = createUndo(reducer)
  const redo = createRedo(reducer)

  return (state = initialState, action) => {

    if (isUndoAction(action))
      return travelNStates(state, action.payload, undo)

    if (isRedoAction(action))
      return travelNStates(state, action.payload, redo)

    return updateHistory(state, reducer(state.present, action), action, comparator)

  }

}

export const undoable: Undoable = (reducer, initAction = { type: 'ngrx-undoable/INIT' } as any, comparator = (s1, s2) => s1 === s2) => {

  return {
    reducer  : createUndoableReducer(reducer, initAction, comparator),
    selectors: createSelectors(reducer),
    setters  : createSetters(reducer)
  }

}
