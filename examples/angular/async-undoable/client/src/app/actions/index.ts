import { Action } from "@ngrx/store";
import { UndoAction, RedoAction, UndoableTypes } from "ngrx-undoable";

import { Bear } from "../reducers";

export const ADD_BEAR = 'ADD_BEAR'
export const UNDO_ADD_BEAR = 'UNDO_ADD_BEAR'
export const REDO_ADD_BEAR = 'REDO_ADD_BEAR'

export const REMOVE_BEAR = 'REMOVE_BEAR'
export const UNDO_REMOVE_BEAR = 'UNDO_REMOVE_BEAR'
export const REDO_REMOVE_BEAR = 'REDO_REMOVE_BEAR'


// we create a custom undo action which has an additional undoneAction
// property that represents the action that was undone, so we can
// use it in effects
// alternatively we could query the state in effects like this:
// withLatestFrom(store.select(getUndoneAction), ...)
// where getUndoneAction would return getFutureActions[0]
export interface AsyncUndoAction extends UndoAction {
  undoneAction: BearAction
}

export interface AsyncRedoAction extends RedoAction {
  redoneAction: BearAction
}

export interface AddBearAction extends Action {
  readonly type: typeof ADD_BEAR
  payload: Bear
}

export interface UndoAddBearAction extends Action {
  readonly type: typeof UNDO_ADD_BEAR
  payload: Bear
}

export interface RedoAddBearAction extends Action {
  readonly type: typeof REDO_ADD_BEAR
  payload: Bear
}

export interface RemoveBearAction extends Action {
  readonly type: typeof REMOVE_BEAR
  payload: Bear
}

export interface UndoRemoveBearAction extends Action {
  readonly type: typeof UNDO_REMOVE_BEAR
  payload: Bear
}

export interface RedoRemoveBearAction extends Action {
  readonly type: typeof REDO_REMOVE_BEAR
  payload: Bear
}

export const asyncUndoAction = (undoneAction: BearAction) => ({
  type: UndoableTypes.UNDO,
  undoneAction
}) as AsyncUndoAction

export const asyncRedoAction = (redoneAction: BearAction) => ({
  type: UndoableTypes.REDO,
  redoneAction
}) as AsyncRedoAction

export const addBear = (bear: Bear) => ({
  type: ADD_BEAR,
  payload: bear
}) as AddBearAction

export const undoAddBear = (bear: Bear) => ({
  type: UNDO_ADD_BEAR,
  payload: bear
}) as UndoAddBearAction

export const redoAddBear = (bear: Bear) => ({
  type: REDO_ADD_BEAR,
  payload: bear
}) as RedoAddBearAction

export const removeBear = (bear: Bear) => ({
  type: REMOVE_BEAR,
  payload: bear
}) as RemoveBearAction

export const undoRemoveBear = (bear: Bear) => ({
  type: UNDO_REMOVE_BEAR,
  payload: bear
}) as UndoRemoveBearAction

export const redoRemoveBear = (bear: Bear) => ({
  type: REDO_REMOVE_BEAR,
  payload: bear
}) as RedoRemoveBearAction

export type BearAction =
    AddBearAction
  | UndoAddBearAction
  | RedoAddBearAction
  | RemoveBearAction
  | UndoRemoveBearAction
  | RedoRemoveBearAction
