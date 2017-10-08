# <img src='https://raw.githubusercontent.com/JannicBeck/redux-undoable/master/logo/logo.png?token=AI2CACFgaovya0RMkjrQ9RN4Cai5DLr0ks5Z48vMwA%3D%3D' height='30'> Redux-Undoable

# Redux-Undoable ⎌
[Redux](https://github.com/reactjs/redux)/[Ngrx](https://github.com/ngrx) implementation of [Undo/Redo](http://redux.js.org/docs/recipes/ImplementingUndoHistory.html) based on Actions instead of States

![build status](https://circleci.com/gh/JannicBeck/redux-undoable.svg?style=shield&circle-token=cc8e771451b141cec76a278794a6c9077e58dfc9)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/JannicBeck/redux-undoable/blob/master/LICENSE)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-Typescript-blue.svg)](https://www.typescriptlang.org/)

## Installation
### npm
```
npm install --save redux-undoable
```

### yarn
```
yarn add redux-undoable --save
```
## Usage
```js
import { undoable } from 'redux-undoable'
const undoableReducer = undoable(reducer, initAction)
```
`reducer` is the reducer which you want to add undo and redo functionality to and `initAction` is the action which initializes your `reducer`.

`undoableReducer` is the Undoable Reducer, it works just like your `reducer` except that the `state` now looks like this:

```js
{
  past    : [ initAction ]
  present : state
  future  : [ ]
}
```
Every action you dispatch will be added to the past.
Lets look at the popular [counter](https://github.com/reactjs/redux/tree/master/examples/counter) example.

```js
const undoableCounter = undoable(counter)

const initialState = undoableCounter(undefined, { type: 'INIT_UNDOABLE_COUNTER' })

{
  past    : [ { type: 'INIT_COUNTER' } ]
  present : 0
  future  : [ ]
}

const state1 = undoableCounter(initialState, 'INCREMENT')

{
  past    : [ { type: 'INIT_COUNTER' }, { type: 'INCREMENT' } ]
  present : 1
  future  : [ ]
}

const state2 = undoableCounter(state1, { type: 'DECREMENT' })

{
  past    : [ { type: 'INIT_COUNTER' }, { type: 'INCREMENT' }, { type: 'DECREMENT' } ]
  present : 0
  future  : [ ]
}
```

