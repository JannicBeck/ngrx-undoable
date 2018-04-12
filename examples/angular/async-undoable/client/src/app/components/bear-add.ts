import { Component, Output, EventEmitter } from '@angular/core';
import { Bears, Bear } from '../reducers';

@Component({
  selector: 'bear-add',
  template: `
  <input #bear type="text" placeholder="Enter Bear...">
  <button (click)="add(bear)">
    Add Bear
  </button>
  `
})
export class BearAdd {

  @Output() addBear = new EventEmitter<Bear>()

  add(input) {
    this.addBear.emit(input.value)
    input.value = ''
  }

}
