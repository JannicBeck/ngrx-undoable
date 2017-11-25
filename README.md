# <img src='https://github.com/JannicBeck/redux-undoable/blob/master/logo/logo.png?raw=true' height='30'> Redux-Undoable

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
const undoableCounter = undoable(counter).reducer
const undoableSelectors = undoable(counter).selectors

const initialState = undoableCounter(undefined, { type: 'INIT_UNDOABLE_COUNTER' })

{
  past    : [ { type: 'INIT' } ]
  present : 0
  future  : [ ]
}

const state1 = undoableCounter(initialState, { type: 'INCREMENT' })

{
  past    : [ { type: 'INIT' }, { type: 'INCREMENT' } ]
  present : 1
  future  : [ ]
}

const state2 = undoableCounter(state1, { type: 'DECREMENT' })

{
  past    : [ { type: 'INIT' }, { type: 'INCREMENT' }, { type: 'DECREMENT' } ]
  present : 0
  future  : [ ]
}
```

### Selectors
`const undoableSelectors = undoable(counter).selectors`

These are your selectors to query the undoable state, use them!!
Do *not* just select the state via state.past or state.present!

The selectors are the contract between this library and your code they won't change and guarantee
that I won't break your app when adding features to this library.

#### State Selectors
```js
undoableSelectors.getPastStates(state)
```
An Array of State objects that represent the past in the order: [oldest, latest]
```js
undoableSelectors.getPresentState(state)
```
The current State
```js
undoableSelectors.getFutureStates(state)
```
An Array of State objects that represent the future in the order: [latest, oldest]

#### Action Selectors
```js
undoableSelectors.getPastActions(state)
```
An Array of Action objects that represent the past in the order: [oldest, latest]
```js
undoableSelectors.getPresentAction(state)
```
getPresentAction The current Action
```js
undoableSelectors.getFutureActions(state)
```
An Array of Action objects that represent the future in the order: [latest, oldest]

#### Custom Selectors
Of course you can create your own selectors, but make sure you use the existing ones as an input for your new ones f.e. using [reselect](https://github.com/reactjs/reselect):
```js
createSelector(getPastStates, pastStates => pastStates.filter(x => x > 1))
```

### Undo
There are two recommended ways to create an undo action:
1. Use the action creator
```js
import { undo } from 'redux-undoable'
const undoAction = undo()
```
2. Use the UndoableTypes
```js
import { UndoableTypes } from 'redux-undoable'
const undoAction = { type: UndoableTypes.UNDO }
```

```js
const initialState =
{
  past    : [ { type: 'INIT' }, { type: 'INCREMENT' }, { type: 'DECREMENT' } ]
  present : 0
  future  : [ ]
}

undoableCounter(initialState, undoAction)

{
  past    : [ { type: 'INIT' }, { type: 'INCREMENT' } ]
  present : 1
  future  : [ { type: 'DECREMENT' } ]
}
```
The payload of the undo action corresponds to the number of steps to undo, it defaults to 1.
If the payload is greater than past.length, all actions will be undone.

```js
undoableCounter(initialState, undo(2))

{
  past    : [ { type: 'INIT' },  ]
  present : 0
  future  : [ { type: 'DECREMENT' }, { type: 'INCREMENT' } ]
}
```

### Redo
Redo works pretty much analogous to undo:
```js
import { redo } from 'redux-undoable'

const initialState =
{
  past    : [ { type: 'INIT' }, { type: 'INCREMENT' } ]
  present : 1
  future  : [ { type: 'DECREMENT' } ]
}

undoableCounter(initialState, redo())

{
  past    : [ { type: 'INIT' }, { type: 'INCREMENT' }, { type: 'DECREMENT' } ]
  present : 1
  future  : [ ]
}
```

### Group
The group action is a sepcial undoable action. It will group the actions given in the payload, and store them as an array inside the past. Undo will then undo them as one single step.
```js
import { group } from 'redux-undoable'
const incrementTwice = group({ type: 'INCREMENT' }, { type: 'INCREMENT' })
```
```js
import { UndoableTypes } from 'redux-undoable'
const incrementTwice = { type: UndoableTypes.GROUP, payload: [ { type: 'INCREMENT' }, { type: 'INCREMENT' } ] }
```

```js
const state1 = undoableCounter(initialState, incrementTwice)

{
  past    : [ { type: 'INIT' }, [ { type: 'INCREMENT' }, { type: 'INCREMENT' } ] ]
  present : 2
  future  : [ ]
}

const state2 = undoableCounter(state1, undo(1))

{
  past    : [ { type: 'INIT' } ]
  present : 0
  future  : [ [ { type: 'INCREMENT' }, { type: 'INCREMENT' } ] ]
}
```

## Optional Parameters

### initAction
You may have wondered where `{ type: 'INIT' }` inside the past comes from.
Its the default initAction with which your reducer is called when it is initialized.

But you may provide a custom init action via the second parameter to `undoable`.
```js
const undoableCounter = undoable(counter, { type: 'MY_CUSTOM_INIT' })

{
  past    : [ { type: 'MY_CUSTOM_INIT' } ]
  present : 0
  future  : [ ]
}
```

### Comparator
The third argument of `undoable` is a comparator function which compares two states in order to detect state changes.

- If it evaluates to true, the action history is not updated and the state is returned.
- If it evaluates to false, the action history is updated and the new state is returned.
- The default comparator uses strict equality `(s1, s2) => s1 === s2`.
- To add every action to the history one would provide the comparator `(s1, s2) => false`.

```js
undoable(counter, initAction, (s1, s2) => false)
```





