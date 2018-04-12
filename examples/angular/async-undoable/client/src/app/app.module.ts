import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { StoreModule, ActionReducerMap } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { UndoableState } from 'ngrx-undoable';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { App } from './app.component';
import { BearList } from './components/bear-list';
import { BearAdd } from './components/bear-add';
import { reducers } from './reducers';
import { BearUndo } from './components/bear-undo';
import { BearEffects } from './effects';
import { HttpClientModule } from '@angular/common/http';
import { BearService } from './services/bear.service';


@NgModule({
  declarations: [
    App,
    BearList,
    BearAdd,
    BearUndo
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    StoreModule.forRoot(reducers),
    StoreDevtoolsModule.instrument(),
    EffectsModule.forRoot([ BearEffects ])
  ],
  providers: [
    BearService
  ],
  bootstrap: [ App ]
})
export class AppModule { }
