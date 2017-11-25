import { counter, CounterAction } from '../../../../../counter';
import { undoable } from '../../../../../src/undoable.reducer';
import { createSelector } from '@ngrx/store';
import { Undoable, UndoableState } from '../../../../../src/interfaces/public';

export interface Root {
  counter: UndoableState<number, CounterAction>
}

export const undoableCounter = undoable(counter)

export const getCounter = (state: Root) => state.counter

export const getPresentState = createSelector(getCounter, undoableCounter.selectors.getPresentState)
export const getPastStates = createSelector(getCounter, undoableCounter.selectors.getPastStates)
export const getFutureStates = createSelector(getCounter, undoableCounter.selectors.getFutureStates)
