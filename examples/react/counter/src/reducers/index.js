import { undoable } from 'ngrx-undoable';
import { counter } from './counter';

export default undoable(counter).reducer
