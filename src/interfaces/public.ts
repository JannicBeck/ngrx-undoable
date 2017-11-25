import {
  UndoableAction,
  RedoAction,
  UndoAction
} from '../undoable.action'


/**
 * A simple Redux Action
 */
export interface Action {
  type      : string
  payload?  : any
}


/**
 * The Reducer which is passed to the Undoable Reducer.
 * 
 * @template S State object type.
 * @template A Action object type.
 * 
 */
export interface Reducer<S, A extends Action> {
  (state: Readonly<S>, action: A | Action): S
}

/**
 * The State object type of the undoable reducer
 * 
 * @template S State object type.
 * @template A Action object type.
 * 
 * @member past An Array of Action objects that represent the past in the order: [oldest, latest]
 * @member present The current State
 * @member future An Array of Action objects that represent the future in the order: [latest, oldest]
 * 
 */
export interface UndoableState<S, A extends Action> {
  past    : (A | A[])[]
  present : S
  future  : (A |A[])[]
}


// action should be `UndoableAction | A` but this ruins type safety inside the undoable reducer
/**
 * The undoable higher order reducer, wraps the provided reducer and
 * creates a history from it.
 * 
 * @template S State object type.
 * @template A Action object type.
 * 
 */
export interface Undoable {
  <S, A extends Action, I extends Action>(reducer: Reducer<S, A | Action>, initAction?: I | Action, comparator?: Comparator<S>): UndoableMap<S, A>
}

export interface UndoableMap<S, A extends Action> {
  reducer   : UndoableReducer<S, A>
  selectors : Selectors<S, A>
}

export interface UndoableReducer<S, A extends Action> {
  (state: UndoableState<S, A | Action> | UndoableState<S, Action>, action: A | Action): UndoableState<S, A | Action> | UndoableState<S, Action>
}

/**
 * 
 * A function which compares two states in order to detect state changes.
 * If it evaluates to true, the action history is not updated and the state is returned.
 * If it evaluates to false, the action history is updated and the new state is returned.
 * The default comparator uses strict equality (s1, s2) => s1 === s2.
 * To add every action to the history one would provide the comparatar (s1, s2) => false.
 * 
 * @template S State object type.
 * 
 */
export type Comparator<S> = (s1: S, s2: S) => boolean

export interface Selectors<S, A extends Action> {
    getPresentState  : (state: UndoableState<S, A>) => S
    getPastStates    : (state: UndoableState<S, A>) => S[]
    getFutureStates  : (state: UndoableState<S, A>) => S[]
}