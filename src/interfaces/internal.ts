import {
  Action,
  UndoableState,
  Reducer,
  Comparator,
  Selectors,
  UndoableReducer
} from './public'


export interface CreateUndoableReducer {
  <S, A extends Action>(reducer: Reducer<S, A>, initAction: A, comparator: Comparator<S>) : UndoableReducer<S, A>
}


export interface UpdateHistory {
  <S, A extends Action>(undoable: UndoableState<S, A>, newPresent: S, action: A, comparator: Comparator<S>): UndoableState<S, A>
}


export interface CreateTravelOne {
  <S, A extends Action>(reducer: Reducer<S, A>): TravelOne<S, A>
}


export interface TravelOne<S, A extends Action> {
  (state: UndoableState<S, A>, nStates: number): UndoableState<S, A>
}


export interface TravelNStates {
  <S, A extends Action>(state: UndoableState<S, A>, nStates: number, travelOne: TravelOne<S, A>): UndoableState<S, A>
}


export interface DoNStatesExist {
  <S>(states: S[], nStates: number): boolean
}


export interface CalculateState {
  <S, A extends Action>(reducer: Reducer<S, A>, actions: (A | A[])[], state?: S): S
}


export interface CreateSelectors {
  <S, A extends Action>(reducer: Reducer<S, A>): Selectors<S, A>
}
