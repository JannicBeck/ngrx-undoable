import {
  Action,
  UndoableState,
  Reducer
} from './public'


export interface UpdateHistory {
  <S, A extends Action | Action>(undoable: UndoableState<S, A | Action>, newState: S, newAction: A): UndoableState<S, A | Action>
}


export interface TravelOnce<S, A extends Action | Action> {
  (state: UndoableState<S, A | Action>): UndoableState<S, A | Action>
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
  (actions: A[]): S
}

export interface CreateGetPresentState {
  <S, A extends Action | Action, I extends Action>(reducer: Reducer<S, A | Action>, initAction: I): GetPresentState<S, A | Action>
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


export interface GetTravel {
  <S, A extends Action | Action, I extends Action>(reducer: Reducer<S, A | Action>, initAction: I): Travel<S, A | Action>
}
