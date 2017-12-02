import { Action } from './interfaces/public'


export enum UndoableTypes {
  UNDO  = 'redux-undoable/UNDO',
  REDO  = 'redux-undoable/REDO',
  GROUP = 'redux-undaoble/GROUP'
}


/**
 * Undo a number of actions.
 * @interface
 * @member {number} payload - The number of steps to undo (must be positive and less than the length of the past)
 */
export interface UndoAction extends Action {
  readonly type: UndoableTypes.UNDO
  payload?: number
}


/**
 * Redo a number of actions.
 * @interface
 * @member {number} payload - The number of steps to redo (must be positive and less than the length of the future)
 */
export interface RedoAction extends Action {
  readonly type: UndoableTypes.REDO
  payload?: number
}


/**
 * Group actions.
 * @interface
 * @member {Action[]} payload - An array of actions which will be grouped into one
 */
export interface GroupAction<A extends Action> extends Action {
  readonly type: UndoableTypes.GROUP
  payload?: A[]
}

/*
 * Action Creators
 */

export const redo = (nStates = 1): RedoAction => {
  return {
    type    : UndoableTypes.REDO,
    payload : nStates
  }
}


export const undo = (nStates = 1): UndoAction => {
  return {
    type    : UndoableTypes.UNDO,
    payload : nStates
  }
}


export const group = <A extends Action>(...actions: A[]): GroupAction<A> => {
  return {
    type    : UndoableTypes.GROUP,
    payload : actions
  }
}


export type UndoableAction<A extends Action>
  = UndoAction
  | RedoAction
  | GroupAction<A>
