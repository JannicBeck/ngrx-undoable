import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';

import { AppComponent } from './app.component';
import { undoableCounter } from './reducer';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    StoreModule.forRoot({ counter: undoableCounter.reducer })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
