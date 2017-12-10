import {
  DoNStatesExist,
  CalculateState,
  TravelNStates,
  CreateTravelOne,
  AddToHistory,
  UpdateHistory,
  CreateSelectors,
  CreateUndoableReducer
} from './interfaces/internal';

import {
  Undoable,
  Action,
  UndoableReducer
} from './interfaces/public';

import { UndoableTypes } from './undoable.action';


// abstract from the order of future and past
const latestFrom = <T> (x: T[]) => x[ x.length - 1 ]
const withoutLatest = <T> (x: T[]) => x.slice(0, x.length -1)
const withoutOldest = <T> (x: T[]) => x.slice(1, x.length)
const addTo = <T> (x: (T | T[])[], y: T[] | T) => y ? [ ...x, y ] : x

// when grouping actions we will get multidimensional arrays
// so this helper is used to flatten the history
const flatten = <T> (x: (T | T[])[]) => [].concat(...x) as T[]


// since the oldest past is the init action we never want to remove it from the past
const doNPastStatesExit: DoNStatesExist = (past, nStates) => past.length > nStates
const doNFutureStatesExit: DoNStatesExist = (future, nStates) => future.length >= nStates


// actions can be an array of arrays because of grouped actions, so we flatten it first
const calculateState: CalculateState = (reducer, actions) => 
  flatten(actions).reduce(reducer, undefined)



const travelNStates: TravelNStates = (state, nStates, travelOne) => {

  if (nStates === 0) return state

  return travelNStates(travelOne(state, nStates), --nStates, travelOne)

}



const createUndo: CreateTravelOne = reducer => (state, nStates = 1) => {

  if (!doNPastStatesExit(state.past, nStates)) {
    return state
  }

  const latestPast = latestFrom(state.past)
  const futureWithLatestPast = addTo(state.future, latestPast)
  const pastWithoutLatest = withoutLatest(state.past)

  return {
    past    : pastWithoutLatest,
    present : calculateState(reducer, pastWithoutLatest),
    future  : futureWithLatestPast
  }

}



const createRedo: CreateTravelOne = reducer => (state, nStates = 1) => {

  if (!doNFutureStatesExit(state.future, nStates)) {
    return state
  }

  const latestFuture = latestFrom(state.future)
  const pastWithLatestFuture = addTo(state.past, latestFuture)

  return {
    past    : pastWithLatestFuture,
    present : calculateState(reducer, pastWithLatestFuture),
    future  : withoutLatest(state.future)
  }

}



const addToHistory: AddToHistory = ( { past, future }, newPresent, actions) => {

  const newPast = addTo(past, actions)

  return {
    past    : newPast,
    present : newPresent,
    future  : [ ]
  }

}


const updateHistory: UpdateHistory = (state, newPresent, action, comparator) => {

  if (comparator(state.present, newPresent)) {
    return state
  }

  return addToHistory(state, newPresent, action)
}



const createSelectors: CreateSelectors = reducer => {

  return {
    getPastStates    : state => state.past.slice(1, state.past.length).map((a, i) => calculateState(reducer, state.past.slice(0, i + 1))),
    getPresentState  : state => state.present,
    getFutureStates  : state => [...state.future].reverse().map((a, i) => calculateState(reducer, state.past.concat([...state.future].reverse().slice(0, i + 1)))),
    getPastActions   : state => flatten(state.past),
    getLatestAction  : state => flatten(state.past)[0],
    getFutureActions : state => flatten([...state.future].reverse())
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



export const undoable: Undoable = (reducer, initAction = { type: 'INIT' } as Action, comparator = (s1, s2) => s1 === s2) => {

  return {
    reducer   : createUndoableReducer(reducer, initAction, comparator),
    selectors : createSelectors(reducer)
  }

}
