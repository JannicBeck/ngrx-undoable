import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { increment, decrement, CounterAction } from './counter';
import { undo, redo, group } from '../../../../../src/undoable.action';
import { UndoableState } from '../../../../../src/interfaces/public';
import { getPresentState, Root, getPastStates, getFutureStates } from './reducer';

@Component({
  selector: 'undoable-counter',
  template: `
    <button (click)="increment()">Increment</button>
    <button (click)="decrement()">Decrement</button>
    <button (click)="undo()">Undo</button>
    <button (click)="redo()">Redo</button>

    <h1>STATE</h1>
    <h2>PAST</h2>
    <ul *ngFor="let p of past$ | async">
      <li>{{p}}</li>
    </ul>
    <h2>PRESENT</h2>
    {{ present$ | async }}
    <h2>FUTURE</h2>
    <ul *ngFor="let f of future$ | async">
      <li>{{f}}</li>
    </ul>

    <button (click)="incrementGroup()">Group increment</button>
    <button (click)="decrementGroup()">Group decrement</button>
    <button (click)="group()">Execute Group</button>

    <ul *ngFor="let g of grouped">
      <li>{{g.type}}</li>
    </ul>
  `
})
export class AppComponent {
  
  present$: Observable<number>;

  past$: Observable<number[]>;

  future$: Observable<number[]>;

  grouped: CounterAction[] = [];
  
  constructor(private store: Store<Root>) {
    this.present$ = this.store.select(getPresentState);
    this.past$ = this.store.select(getPastStates);
    this.future$ = this.store.select(getFutureStates);
  }

  increment(){
    this.store.dispatch(increment());
  }

  decrement(){
    this.store.dispatch(decrement());
  }

  undo() {
    this.store.dispatch(undo());
  }

  redo() {
    this.store.dispatch(redo());
  }

  incrementGroup() {
    this.grouped.push(increment())
  }

  decrementGroup() {
    this.grouped.push(decrement())
  }

  group() {
    this.store.dispatch(group(...this.grouped));
    this.grouped = [];
  }

}
