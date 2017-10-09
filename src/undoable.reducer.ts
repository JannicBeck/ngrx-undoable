import {
  CreateTravelNStates,
  CreateTravelOne,
  TravelNStates,
  CreateTravel,
  CreateGetPresentState,
  DoNStatesExist,
  AddToHistory,
  CreateUpdateHistory
} from './interfaces/internal'

import { Undoable, Action } from './interfaces/public'

import { UndoableTypes } from './undoable.action'


// abstract from the order of future and past
const latestFrom    = <T> (x: T[]) => x[ x.length - 1 ]
const withoutLatest = <T> (x: T[]) => x.slice(0, x.length -1)
const withoutOldest = <T> (x: T[]) => x.slice(1, x.length)
const addTo         = <T> (x: (T | T[])[], y: T[] | T) => y ? [ ...x, y ] : x


// (number | number[])

// since the oldest past is the init action we never want to remove it from the past
const doNPastStatesExit: DoNStatesExist = (past, nStates) => past.length > nStates
const doNFutureStatesExit: DoNStatesExist = (future, nStates) => future.length >= nStates


const createGetPresentState: CreateGetPresentState = reducer => actions =>
  [].concat(...actions).reduce(reducer, undefined)



const createTravelNStates: CreateTravelNStates = (travelOnce) => {

  return function travelNStates (state, nStates) {

    if (nStates === 0) {
      return state
    }

    return travelNStates(travelOnce(state, nStates), --nStates)

  }

}



const createTravelOne: CreateTravelOne = (getPresentState) => {

  return {

    undo (state, nStates = 1) {

      if (!doNPastStatesExit(state.past, nStates)) {
        return state
      }

      const latestPast = latestFrom(state.past)
      const futureWithLatestPast = addTo(state.future, latestPast)
      const pastWithoutLatest = withoutLatest(state.past)

      return {
        past    : pastWithoutLatest,
        present : getPresentState(pastWithoutLatest),
        future  : futureWithLatestPast
      }

    },

    redo (state, nStates = 1) {

      if (!doNFutureStatesExit(state.future, nStates)) {
        return state;
      }

      const latestFuture = latestFrom(state.future)
      const pastWithLatestFuture = addTo(state.past, latestFuture)
      
      return {
        past    : pastWithLatestFuture,
        present : getPresentState(pastWithLatestFuture),
        future  : withoutLatest(state.future)
      }

    }

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


export const createUpdateHistory: CreateUpdateHistory = comparator => (state, newPresent, action) => {
  
  if (comparator(state.present, newPresent)) {
    return state
  }

  return addToHistory(state, newPresent, action)
}


export const undoable: Undoable = (reducer, initAction = { type: 'INIT' } as Action, comparator = (s1, s2) => s1 === s2 ) => {

  const initialState = {
    past    : [ initAction ],
    present : reducer(undefined, initAction),
    future  : [ ]
  }

  const getPresentState = createGetPresentState(reducer)
  const travelOne       = createTravelOne(getPresentState)
  const undoNStates     = createTravelNStates(travelOne.undo)
  const redoNStates     = createTravelNStates(travelOne.redo)

  const updateHistory   = createUpdateHistory(comparator)

  return (state = initialState, action) => {

    switch (action.type) {

      case UndoableTypes.UNDO:
        return undoNStates(state, action.payload)

      case UndoableTypes.REDO:
        return redoNStates(state, action.payload)

      case UndoableTypes.GROUP:
        return updateHistory(state, action.payload.reduce(reducer, state.present), action.payload)

      default:
        return updateHistory(state, reducer(state.present, action), action)

    }

  }

}
