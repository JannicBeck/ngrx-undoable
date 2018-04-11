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
  UndoableState
} from './interfaces/public';

import { UndoableTypes } from './undoable.action';


// when grouping actions we will get multidimensional arrays
// so this helper is used to flatten the history
const flatten = <T> (x: (T | T[])[]) => [].concat(...x) as T[]


// since the oldest past is the init action we never want to remove it from the past
const doNPastStatesExist: DoNStatesExist = (past, nStates) => past.length > nStates
const doNFutureStatesExist: DoNStatesExist = (future, nStates) => future.length >= nStates


// actions can be an array of arrays because of grouped actions, so we flatten it first
const calculateState: CalculateState = (reducer, actions, state) => 
  flatten(actions).reduce(reducer, state)



const travelNStates: TravelNStates = (state, nStates = 1, travelOne) => {

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
const getPresentAction = <S, A extends Action>(state: UndoableState<S, A>) => state.past[state.past.length - 1]
const getFutureActions = <S, A extends Action>(state: UndoableState<S, A>) => state.future
const getPresentState  = <S, A extends Action>(state: UndoableState<S, A>) => state.present

const getPastActionsFlattened   = <S, A extends Action>(state: UndoableState<S, A>) => flatten(state.past)
const getPresentActionFlattened = <S, A extends Action>(state: UndoableState<S, A>) => getPastActionsFlattened(state).slice(-1)[0]
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


export const createSelectors = <S, A extends Action>(reducer: Reducer<S, A>) => {

  return {
    getPresentState,
    getPastStates: createGetPastStates(reducer),
    getFutureStates: createGetFutureStates(reducer), 
    getPastActions: getPastActionsFlattened,
    getPresentAction: getPresentActionFlattened,
    getFutureActions: getFutureActionsFlattened
  }

}



const createUndoableReducer: CreateUndoableReducer = (reducer, initAction, comparator) => {

  const initialState = {
    past    : [ initAction ],
    present : reducer(undefined, initAction),
    future  : [ ] as Action[]
  }

  const undo = createUndo(reducer)
  const redo = createRedo(reducer)

  return (state = initialState, action) => {

    switch (action.type) {

      case UndoableTypes.UNDO:
        return travelNStates(state, action.payload, undo)

      case UndoableTypes.REDO:
        return travelNStates(state, action.payload, redo)

      case UndoableTypes.GROUP:
        return updateHistory(state, action.payload.reduce(reducer, state.present), action.payload, comparator)

      default:
        return updateHistory(state, reducer(state.present, action), action, comparator)

    }

  }

}



export const undoable: Undoable = (reducer, initAction = { type: 'ngrx-undoable/INIT' } as Action, comparator = (s1, s2) => s1 === s2) => {

  return {
    reducer   : createUndoableReducer(reducer, initAction, comparator),
    selectors : createSelectors(reducer)
  }

}
