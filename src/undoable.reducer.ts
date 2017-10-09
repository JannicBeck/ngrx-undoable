import {
  TravelNStates,
  GetPresentState,
  DoNStatesExist,
  AddToHistory,
  UpdateHistory,
  CreateTravelOne,
  CreateSelector
} from './interfaces/internal'

import { Undoable, Action } from './interfaces/public'

import { UndoableTypes } from './undoable.action'


// abstract from the order of future and past
const latestFrom    = <T> (x: T[]) => x[ x.length - 1 ]
const withoutLatest = <T> (x: T[]) => x.slice(0, x.length -1)
const withoutOldest = <T> (x: T[]) => x.slice(1, x.length)
const addTo         = <T> (x: (T | T[])[], y: T[] | T) => y ? [ ...x, y ] : x


// since the oldest past is the init action we never want to remove it from the past
const doNPastStatesExit: DoNStatesExist = (past, nStates) => past.length > nStates
const doNFutureStatesExit: DoNStatesExist = (future, nStates) => future.length >= nStates


const getPresentState: GetPresentState = (reducer, actions) =>
  [].concat(...actions).reduce(reducer, undefined)



const travelNStates: TravelNStates = (travelOne, state, nStates) => {
  
  if (nStates === 0) {
    return state
  }

  return travelNStates(travelOne, travelOne(state, nStates), --nStates)

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
    present : getPresentState(reducer, pastWithoutLatest),
    future  : futureWithLatestPast
  }

}



const createRedo: CreateTravelOne = reducer => (state, nStates = 1) => {

  if (!doNFutureStatesExit(state.future, nStates)) {
    return state;
  }

  const latestFuture = latestFrom(state.future)
  const pastWithLatestFuture = addTo(state.past, latestFuture)
  
  return {
    past    : pastWithLatestFuture,
    present : getPresentState(reducer, pastWithLatestFuture),
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


export const updateHistory: UpdateHistory = (state, newPresent, action, comparator) => {
  
  if (comparator(state.present, newPresent)) {
    return state
  }

  return addToHistory(state, newPresent, action)
}


export const undoable: Undoable = (reducer, initAction = { type: 'INIT' } as Action, comparator = (s1, s2) => s1 === s2 ) => {

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
        return travelNStates(undo, state, action.payload)

      case UndoableTypes.REDO:
        return travelNStates(redo, state, action.payload)

      case UndoableTypes.GROUP:
        return updateHistory(state, action.payload.reduce(reducer, state.present), action.payload, comparator)

      default:
        return updateHistory(state, reducer(state.present, action), action, comparator)

    }

  }

}
// TODO: don't store present state at all but use a selector!
export const createGetPresent: CreateSelector = reducer => state => getPresentState(reducer, state.past)
export const createGetPast   : CreateSelector = reducer => state => state.past.map((a, i) => getPresentState(reducer, state.past.slice(0, i)))
export const createGetFuture : CreateSelector = reducer => state => state.future.map((a, i) => getPresentState(reducer, state.past.concat(state.future.slice(0, i))))
