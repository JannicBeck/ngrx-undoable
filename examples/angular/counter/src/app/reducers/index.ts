import { createSelector } from '@ngrx/store';
import { undoable, UndoableState } from 'ngrx-undoable';

import { CounterAction, Count } from "../actions";

export const counter = (state = 0, action: CounterAction) => {

  switch (action.type) {

    case Count.INCREMENT:
      return state + 1

    case Count.DECREMENT:
      return state - 1

    default:
      return state

  }

}

export interface Root {
  counterHistory: UndoableState<number, CounterAction>
}

export const undoableCounter = undoable(counter)
export const reducers = { counterHistory: undoableCounter.reducer }

export const getCounterHistory = (state: Root) => state.counterHistory
export const getPresentState = createSelector(getCounterHistory, undoableCounter.selectors.getPresentState)
export const getPastStates = createSelector(getCounterHistory, undoableCounter.selectors.getPastStates)
export const getFutureStates = createSelector(getCounterHistory, undoableCounter.selectors.getFutureStates)
