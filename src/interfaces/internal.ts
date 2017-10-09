import {
  Action,
  UndoableState,
  Reducer,
  Comparator
} from './public'


export interface AddToHistory {
  <S, A extends Action | Action>(undoable: UndoableState<S, A | Action>, newPresent: S, ...actions: A[]): UndoableState<S, A | Action>
}


export interface CreateUpdateHistory {
  <S, A extends Action | Action>(comparator: Comparator<S>): UpdateHistory<S, A>
}


export interface UpdateHistory<S, A extends Action | Action> {
  (undoable: UndoableState<S, A | Action>, newPresent: S, action: A): UndoableState<S, A | Action>
}


export interface TravelOnce<S, A extends Action | Action> {
  (state: UndoableState<S, A | Action>, nStates: number): UndoableState<S, A | Action>
}


export interface TravelOne<S, A extends Action | Action> {
  undo  : TravelOnce<S, A | Action>
  redo  : TravelOnce<S, A | Action>
}

export interface CreateTravelOne {
  <S, A extends Action | Action>(getPresentState: GetPresentState<S, A | Action>): TravelOne<S, A | Action>
}


export interface TravelNStates<S, A extends Action | Action> {
  (state: UndoableState<S, A | Action>, nStates: number): UndoableState<S, A | Action>
}


export interface DoNStatesExist {
  <S>(states: S[], nStates: number): boolean
}


export interface CreateTravelNStates {
  <S, A extends Action | Action>(travelOnce: TravelOnce<S, A | Action>): TravelNStates<S, A | Action>
}

export interface GetPresentState<S, A extends Action | Action> {
  (actions: (A | A[])[]): S
}

export interface CreateGetPresentState {
  <S, A extends Action | Action>(reducer: Reducer<S, A | Action>): GetPresentState<S, A | Action>
}


export interface TravelInTime<S, A extends Action | Action> {
  (time: Action[], travelNStates: TravelNStates<S, A | Action>): UndoableState<S, A | Action>
}


export interface CreateTravelInTime {
  <S, A extends Action | Action>(state: UndoableState<S, A | Action>, nStates: number): TravelInTime<S, A | Action>
}


export interface Travel<S, A extends Action | Action> {
  (state: UndoableState<S, A | Action>, action: A | Action): UndoableState<S, A | Action>
}


export interface CreateTravel {
  <S, A extends Action | Action>(undoNStates: TravelNStates<S, A | Action>, redoNStates: TravelNStates<S, A | Action>): Travel<S, A | Action>
}
