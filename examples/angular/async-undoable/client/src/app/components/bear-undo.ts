import { Component, EventEmitter, Output, Input } from '@angular/core';

import { selectors, possRedo, possUndo, BearsHistory } from '../reducers';
import { BearAction } from '../actions';

@Component({
  selector: 'bear-undo',
  template: `
    <button (click)="onUndo()" [disabled]="isUndoDisabled()">Undo</button>
    <button (click)="onRedo()" [disabled]="isRedoDisabled()">Redo</button>
  `
})
export class BearUndo {

  @Input() state: BearsHistory

  // we pass the present action to the EventEmitter
  // so we know in the effects which action was undone
  // altenatively we could query the state in effects
  // the undone action would be the first action of the futureActions
  @Output() undo = new EventEmitter<BearAction>()

  @Output() redo = new EventEmitter<BearAction>()

  onUndo() {
    this.undo.emit(selectors.getPresentAction(this.state) as BearAction)
  }

  onRedo() {
    this.redo.emit(selectors.getLatestFutureAction(this.state) as BearAction)
  }

  isUndoDisabled() {
    return !possUndo(this.state) 
  }

  isRedoDisabled() {
    return !possRedo(this.state)
  }

}
