import {
  CreateTravelNStates,
  CreateTravelOne,
  UpdateHistory,
  TravelNStates,
  CreateTravel,
  CreateGetPresentState,
  GetTravel,
  DoNStatesExist
} from './interfaces/internal'

import {
  Action,
  Reducer,
  Comparator,
  Undoable,
  UndoableReducer,
} from './interfaces/public'

import {
  RedoAction,
  UndoAction,
  UndoableAction,
  UndoableTypes
} from './undoable.action'


// abstract from the order of future and past
const latestFrom    = <T> (x: T[]) => x[ x.length - 1 ]
const withoutLatest = <T> (x: T[]) => x.slice(0, x.length -1)
const withoutOldest = <T> (x: T[]) => x.slice(1, x.length)
const addTo         = <T> (x: T[], y: T) => y ? [ ...x, y ] : x


// since the oldest past is the init action we never want to remove it from the past
const doNPastStatesExit   : DoNStatesExist = (past, nStates)   => past.length   > nStates
const doNFutureStatesExit : DoNStatesExist = (future, nStates) => future.length >= nStates


const createGetPresentState: CreateGetPresentState = (reducer, initAction) => actions =>
  actions.reduce(reducer, reducer(undefined, initAction))



const createTravelNStates: CreateTravelNStates = (travelOnce) => {

  return function travelNStates (state, nStates) {

    if (nStates === 0) {
      return state
    }

    return travelNStates(travelOnce(state), --nStates)

  }

}



const createTravelOne: CreateTravelOne = (getPresentState) => {

  return {

    undo ( { past, future }) {

      const latestPast = latestFrom(past)
      const futureWithLatestPast = addTo(future, latestPast)
      const pastWithoutLatest = withoutLatest(past)

      return {
        past    : pastWithoutLatest,
        present : getPresentState(pastWithoutLatest),
        future  : futureWithLatestPast
      }

    },

    redo ( { past, future }) {

      const latestFuture = latestFrom(future)
      const pastWithLatestFuture = addTo(past, latestFuture)
      
      return {
        past    : pastWithLatestFuture,
        present : getPresentState(pastWithLatestFuture),
        future  : withoutLatest(future)
      }

    }

  }

}



const createTravel: CreateTravel = (undoNStates, redoNStates) => (state, action) => {

    const nStates = action.payload

    switch (action.type) {
  
      case UndoableTypes.UNDO:
        return doNPastStatesExit(state.past, nStates) ? undoNStates(state, nStates) : state
  
      case UndoableTypes.REDO:
        return doNFutureStatesExit(state.future, nStates) ? redoNStates(state, nStates) : state
      
      default:
        return state
      
      }
  
  }



export const getTravel: GetTravel = (reducer, initAction) => {
  
  const getPresentState = createGetPresentState(reducer, initAction)
  const travelOne       = createTravelOne(getPresentState)
  const undoNStates     = createTravelNStates(travelOne.undo)
  const redoNStates     = createTravelNStates(travelOne.redo)

  return createTravel(undoNStates, redoNStates)

}



const updateHistory: UpdateHistory = ( { past, future }, newState, action) => {
  
  const newPast = addTo(past, action)

  return {
    past    : newPast,
    present : newState,
    future  : [ ]
  }

}



export const undoable: UndoableReducer = (reducer, initAction, comparator = (s1, s2) => s1 === s2 ) => {

  const initialState = {
    past    : [ initAction ],
    present : reducer(undefined, initAction),
    future  : [ ]
  }

  const travel = getTravel(reducer, initAction)

  return (state = initialState, action) => {

    switch (action.type) {

      case UndoableTypes.UNDO:
      case UndoableTypes.REDO:
        return travel(state, action)

      default:
        const newState = reducer(state.present, action)

        if (comparator(state.present, newState)) {
          return state
        }

        return updateHistory(state, newState, action)

    }

  }

}
