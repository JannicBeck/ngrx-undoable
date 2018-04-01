import {
  Action,
  UndoableState,
  Reducer,
  Comparator,
  Selectors,
  UndoableReducer
} from './public'


export interface CreateUndoableReducer {
  <S, A extends Action | Action, I extends Action>(reducer: Reducer<S, A>, initAction: I, comparator: Comparator<S>) : UndoableReducer<S, A>
}


export interface UpdateHistory {
  <S, A extends Action | Action>(undoable: UndoableState<S, A | Action>, newPresent: S, action: A, comparator: Comparator<S>): UndoableState<S, A | Action>
}


export interface CreateTravelOne {
  <S, A extends Action | Action>(reducer: Reducer<S, A | Action>): TravelOne<S, A>
}


export interface TravelOne<S, A extends Action | Action> {
  (state: UndoableState<S, A | Action>, nStates: number): UndoableState<S, A | Action>
}


export interface TravelNStates {
  <S, A extends Action | Action>(state: UndoableState<S, A | Action>, nStates: number, travelOne: TravelOne<S, A>): UndoableState<S, A | Action>
}


export interface DoNStatesExist {
  <S>(states: S[], nStates: number): boolean
}


export interface CalculateState {
  <S, A extends Action | Action>(reducer: Reducer<S, A | Action>, actions: (A | A[])[], state?: S): S
}


export interface CreateSelectors {
  <S, A extends Action>(reducer: Reducer<S, A>): Selectors<S, A>
}
