import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

import { Bears } from '../reducers';
import { Bear } from '../reducers/index';

@Component({
  selector: 'bear-list',
  template: `
    <div>
      <ul style="list-style-type: none;">
        <li *ngFor="let item of state">
          <button (click)="removeBear.emit(item)">-</button>
          {{item}}
        </li>
      </ul>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BearList {

  @Input() state: Bears 

  @Output() removeBear = new EventEmitter<Bear>()

}