import { Injectable } from "@angular/core";
import { Effect, Actions, ofType } from "@ngrx/effects";
import { map, mergeMap, filter } from 'rxjs/operators';
import { Observable } from "rxjs/Observable";
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';

import { UndoableTypes, UndoAction, undo, RedoAction, redo } from "ngrx-undoable"

import {
  ADD_BEAR,
  REMOVE_BEAR,
  UNDO_ADD_BEAR,
  AddBearAction,
  UndoAddBearAction,
  RemoveBearAction,
  BearAction,
  AsyncUndoAction,
  AsyncRedoAction,
  REDO_ADD_BEAR,
  RedoAddBearAction,
  UNDO_REMOVE_BEAR,
  UndoRemoveBearAction,
  REDO_REMOVE_BEAR,
  RedoRemoveBearAction
} from '../actions';

import { BearService } from '../services/bear.service';
import { asyncUndoAction } from '../actions/index';

@Injectable()
export class BearEffects {

  constructor(private actions$: Actions, private bearService: BearService) {}

  @Effect({ dispatch: false }) addBears$ = this.actions$.pipe(
    ofType(ADD_BEAR),
    map((action: AddBearAction) => this.bearService.postBear(action.payload).toPromise())
  )


  @Effect({ dispatch: false }) removeBears$ = this.actions$.pipe(
    ofType(REMOVE_BEAR),
    map((action: RemoveBearAction) => this.bearService.deleteBear(action.payload).toPromise())
  )


  /**
   * First approach to handle async undo actions
  */
  @Effect({ dispatch: false }) undo$ = this.actions$.pipe(
    ofType(UndoableTypes.UNDO),
    // normal undo actions don't have an undoneAction property so we filter those first
    filter((action: UndoAction | AsyncUndoAction) => action["undoneAction"]), 
    map((asyncUndoAction: AsyncUndoAction) => {

      const bear = asyncUndoAction.undoneAction.payload

      switch (asyncUndoAction.undoneAction.type) { 
        case REMOVE_BEAR:
          return this.bearService.postBear(bear).toPromise()

        case ADD_BEAR:
          return this.bearService.deleteBear(bear).toPromise()
      }

    })
  )

  @Effect({ dispatch: false }) redo$ = this.actions$.pipe(
    ofType(UndoableTypes.REDO),
    // normal undo actions don't have an undoneAction property so we filter those first
    filter((action: RedoAction | AsyncRedoAction) => action["redoneAction"]), 
    map((asyncRedoAction: AsyncRedoAction) => {

      const bear = asyncRedoAction.redoneAction.payload

      switch (asyncRedoAction.redoneAction.type) { 
        case REMOVE_BEAR:
          return this.bearService.deleteBear(bear).toPromise()

        case ADD_BEAR:
          return this.bearService.postBear(bear).toPromise()
      }

    })
  )

  // /**
  //  * Second alternative approach to handle async actions
  //  * 
  //  * If you don't like the approach above or it doesn't fit your use case, you might want to
  //  * specify the undo counterparts for your async actions explicitly as special undo actions (e.g. UndoSelectSubredditAction)
  //  * which will then dispatch the actual undo action if the request was successful 
  // */
  @Effect() undoAddBear$ = this.actions$.pipe(
    ofType(UNDO_ADD_BEAR),
    map((action: UndoAddBearAction) => action.payload),
    mergeMap(bear => this.bearService.deleteBear(bear).map(res => undo()))
  )

  @Effect() redoAddBear$ = this.actions$.pipe(
    ofType(REDO_ADD_BEAR),
    map((action: RedoAddBearAction) => action.payload),
    mergeMap(bear => this.bearService.postBear(bear).map(res => redo()))
  )

  @Effect() undoRemoveBear$ = this.actions$.pipe(
    ofType(UNDO_REMOVE_BEAR),
    map((action: UndoRemoveBearAction) => action.payload),
    mergeMap(bear => this.bearService.postBear(bear).map(res => undo()))
  )

  @Effect() redoRemoveBear$ = this.actions$.pipe(
    ofType(REDO_REMOVE_BEAR),
    map((action: RedoRemoveBearAction) => action.payload),
    mergeMap(bear => this.bearService.deleteBear(bear).map(res => redo()))
  )

}
