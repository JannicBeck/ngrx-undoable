import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { undo, redo } from 'ngrx-undoable';
import {
	addBear,
	undoAddBear,
	removeBear,
	BearAction,
	asyncRedoAction,
	asyncUndoAction,
	ADD_BEAR,
	REMOVE_BEAR,
	redoRemoveBear,
	redoAddBear,
	undoRemoveBear
} from './actions';

import {
	Bear,
	State,
	Bears,
	getBears,
	getBearsHistory,
	BearsHistory
} from "./reducers";

@Component({
	selector: `app-root`,
	template: `
		<h1 class="brand-title">unbearable</h1>
		<bear-add (addBear)="onAddBear($event)"></bear-add>

		<bear-list
			[state]="bears$ | async"
			(removeBear)="onRemoveBear($event)">
		</bear-list>

		<h2>First approach</h2>
		<bear-undo
			[state]="bearsHistory$ | async"
			(undo)="onUndo($event)"
			(redo)="onRedo($event)">
		</bear-undo>

		<h2>Second approach</h2>
		<bear-undo
			[state]="bearsHistory$ | async"
			(undo)="onUndo2($event)"
			(redo)="onRedo2($event)">
		</bear-undo>

	`,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class App implements OnInit {

	bears$: Observable<Bears>

	bearsHistory$: Observable<BearsHistory>

	constructor(private store: Store<State>) {

	}
	
	ngOnInit() {
		this.bears$ = this.store.select(getBears)
		this.bearsHistory$ = this.store.select(getBearsHistory)
	}

	onAddBear(bear: Bear) {
		this.store.dispatch(addBear(bear))
	}

	onRemoveBear(bear: Bear) {
		this.store.dispatch(removeBear(bear))
	}

	// we create a custom undo action which has an additional undoneAction
	// property that represents the action that was undone, so we can use it in effects
	onUndo(undoneAction: BearAction) {
		this.store.dispatch(asyncUndoAction(undoneAction))
	}

	onRedo(redoneAction: BearAction) {
		this.store.dispatch(asyncRedoAction(redoneAction))
	}

	onUndo2(undoneAction: BearAction) {
    const bear = undoneAction.payload
    switch(undoneAction.type) {
      case ADD_BEAR: return this.store.dispatch(undoAddBear(bear))
			case REMOVE_BEAR: return this.store.dispatch(undoRemoveBear(bear))
			default: return this.store.dispatch(undo())
    }
  }

	onRedo2(redoneAction: BearAction) {
    const bear = redoneAction.payload
    switch(redoneAction.type) {
      case ADD_BEAR: return this.store.dispatch(redoAddBear(bear))
			case REMOVE_BEAR: return this.store.dispatch(redoRemoveBear(bear))
			default: return this.store.dispatch(redo())
    }
	}

}
