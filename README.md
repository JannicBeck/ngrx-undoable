# <img src='https://github.com/JannicBeck/ngrx-undoable/blob/master/logo/logo.png?raw=true' height='30'> ngrx-undoable

[Redux](https://github.com/reactjs/redux)/[Ngrx](https://github.com/ngrx) implementation of [Undo/Redo](http://redux.js.org/docs/recipes/ImplementingUndoHistory.html) based on Actions instead of States

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/JannicBeck/ngrx-undoable/blob/master/LICENSE)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-Typescript-blue.svg)](https://www.typescriptlang.org/)

## Installation
### npm
```
npm install ngrx-undoable --save
```

### yarn
```
yarn add ngrx-undoable --save
```

## How it works
If an `action` is dispatched it will call your reducer, then store the resulting state in `present` and add the `action` to the `past`.

If an `Undo` action is dispatched, it calulcates the new state by **replaying** all the `past` actions and stores the action that was undone in the `future`.

If a `Redo` action is dispatched, it reduces the present with the `future action` to calculate the new present. The action that was redone is then added to the past.

**In order for this to work, your reducer has to be pure!**

## Usage
```js
import { undoable } from 'ngrx-undoable'
const undoableReducer = undoable(reducer, initAction).reducer
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

// An Array of State objects that represent the past in the order: [oldest, latest]
[ 0, 1 ]
```

```js
undoableSelectors.getPresentState(state)

// The current State
2
```

```js
undoableSelectors.getFutureStates(state)

// An Array of State objects that represent the future in the order: [latest, oldest]
[ 3, 4 ]
```

#### Action Selectors
```js
undoableSelectors.getPastActions(state)

// An Array of Action objects that represent the past in the order: [oldest, latest]
[ { type: 'INIT' }, { type: 'INCREMENT' } ]
```
```js
undoableSelectors.getLatestAction(state)

// The latest Action
{ type: 'INCREMENT' }
```

```js
undoableSelectors.getFutureActions(state)

// An Array of Action objects that represent the future in the order: [latest, oldest]
[ { type: 'INCREMENT' }, { type: 'INCREMENT' } ]
```

#### Custom Selectors
Of course you can create your own selectors, but make sure you use the existing ones as an input for your new ones f.e. using [reselect](https://github.com/reactjs/reselect):
```js
createSelector(getPastStates, pastStates => pastStates.filter(x => x > 1))
```

### Undo
There are two recommended ways to create an undo action:
1. Use the action creator
```js
import { undo } from 'ngrx-undoable'
const undoAction = undo()
```
2. Use the UndoableTypes
```js
import { UndoableTypes } from 'ngrx-undoable'
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
import { redo } from 'ngrx-undoable'

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
import { group } from 'ngrx-undoable'
const incrementTwice = group({ type: 'INCREMENT' }, { type: 'INCREMENT' })
```
```js
import { UndoableTypes } from 'ngrx-undoable'
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

## Motivation
**TL:DR**
It really just boils down to if your state is fat and your actions are thin or your state is thin and your actions are fat.

- Use [redux-undo](https://github.com/omnidan/redux-undo) if your state is thin and your actions are fat.
- Use [undox](https://github.com/JannicBeck/undox) if your state is fat and your actions are thin and you want maximum performance for that.
- Use this library if you want something in between with a nicer API than undox. (only present state is stored)

The most popular and used library to add undo/redo functionality to redux is without a doubt [redux-undo](https://github.com/omnidan/redux-undo).

It stores the whole state instead of actions. While this is great if we got a lean state and fat actions, it does not scale well if our state tree grows.

This library instead only stores actions, which results in some nice advantages, but also some disadvantages depending on your use case.

### Advantages
- Takes up less space inside localStorage for thin actions and fat states
- Better performance for thin actions and fat states
- A complete history for free!
- Type safety (completely written in TypeScript)
- Smaller in size than redux-undo

### Disadvantages
- Takes up more space inside localStorage for fat actions and thin states
- Worse performance for fat actions and thin states
- Less feature rich than redux-undo




