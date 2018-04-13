import { undoable } from 'ngrx-undoable';

import { counter } from './counter';

const undoableCounter = undoable(counter)
export const reducer = undoableCounter.reducer
export const selectors = undoableCounter.selectors
