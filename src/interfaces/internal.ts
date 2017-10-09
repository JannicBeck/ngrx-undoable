import {
  Action,
  UndoableState,
  Reducer,
  Comparator
} from './public'


export interface AddToHistory {
  <S, A extends Action | Action>(undoable: UndoableState<S, A | Action>, newPresent: S, ...actions: A[]): UndoableState<S, A | Action>
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
  <S, A extends Action | Action>(travelOne: TravelOne<S, A>, state: UndoableState<S, A | Action>, nStates: number): UndoableState<S, A | Action>
}


export interface DoNStatesExist {
  <S>(states: S[], nStates: number): boolean
}


export interface GetPresentState {
  <S, A extends Action | Action>(reducer: Reducer<S, A | Action>, actions: (A | A[])[]): S
}


export interface Selector<S, A extends Action> {
  (state: UndoableState<S, A>): S[] | S
}


export interface CreateSelector {
  <S, A extends Action>(reducer: Reducer<S, A>): Selector<S, A>
}
