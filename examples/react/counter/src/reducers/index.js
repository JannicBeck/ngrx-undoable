import { undoable } from '../redux-undoable';
import { counter } from './counter';

export default undoable(counter).reducer
