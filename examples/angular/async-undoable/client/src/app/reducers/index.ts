import { ActionReducerMap } from '@ngrx/store';
import { undoable, UndoableState } from 'ngrx-undoable';

import {
  ADD_BEAR,
  UNDO_ADD_BEAR,
  REMOVE_BEAR,
  BearAction
} from '../actions'

export type Bear = string
export type Bears = Bear[]
export const initialState: Bears = []

const bears = (state = initialState, action: BearAction) => {
  switch (action.type) {
    case ADD_BEAR:
      return [ ...state, action.payload ]
    case REMOVE_BEAR:
      return state.filter(x => x !== action.payload)
    default:
      return state
  }
}

export type BearsHistory = UndoableState<Bears, BearAction> 

export const { selectors, reducer } = undoable(bears)

export const reducers = {
  bearsHistory: reducer
}

export interface State {
  bearsHistory: BearsHistory
} 

export const getBearsHistory  = (state: State) => state.bearsHistory
export const getBears         = (state: State) => selectors.getPresentState(getBearsHistory(state))
export const getPresentAction = (state: State) => selectors.getPresentAction(getBearsHistory(state))
export const getPastBears     = (state: State) => selectors.getPastStates(getBearsHistory(state))
export const getFutureBears   = (state: State) => selectors.getFutureStates(getBearsHistory(state))

export const possUndo = (state: BearsHistory) => selectors.getPastActions(state).length > 1
export const possRedo = (state: BearsHistory) => selectors.getFutureActions(state).length > 0
