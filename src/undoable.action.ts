import { Action } from './interfaces/public'


export enum UndoableTypes {
  UNDO = 'redux-undoable/UNDO',
  REDO = 'redux-undoable/REDO',
}


/**
 * Undo a number of actions.
 * @interface
 * @member {number} payload - The number of steps to undo (must be positive and less than the length of the past)
 */
export interface UndoAction extends Action {
  type: UndoableTypes.UNDO
  payload?: number
}


/**
 * Redo a number of actions.
 * @interface
 * @member {number} payload - The number of steps to redo (must be positive and less than the length of the future)
 */
export interface RedoAction extends Action {
  type: UndoableTypes.REDO
  payload?: number
}


/*
 * action creators
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


export type UndoableAction
  = UndoAction
  | RedoAction
