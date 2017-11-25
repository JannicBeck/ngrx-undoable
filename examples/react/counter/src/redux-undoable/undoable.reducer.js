"use strict";
exports.__esModule = true;
var undoable_action_1 = require("./undoable.action");
// abstract from the order of future and past
var latestFrom = function (x) { return x[x.length - 1]; };
var withoutLatest = function (x) { return x.slice(0, x.length - 1); };
var withoutOldest = function (x) { return x.slice(1, x.length); };
var addTo = function (x, y) { return y ? x.concat([y]) : x; };
var flatten = function (x) { return [].concat.apply([], x); };
// since the oldest past is the init action we never want to remove it from the past
var doNPastStatesExit = function (past, nStates) { return past.length > nStates; };
var doNFutureStatesExit = function (future, nStates) { return future.length >= nStates; };
// actions can be an array of arrays because of grouped actions, so we flatten it first
var calculateState = function (reducer, actions) {
    return flatten(actions).reduce(reducer, undefined);
};
var travelNStates = function (travelOne, state, nStates) {
    if (nStates === 0) {
        return state;
    }
    return travelNStates(travelOne, travelOne(state, nStates), --nStates);
};
var createUndo = function (reducer) { return function (state, nStates) {
    if (nStates === void 0) { nStates = 1; }
    if (!doNPastStatesExit(state.past, nStates)) {
        return state;
    }
    var latestPast = latestFrom(state.past);
    var futureWithLatestPast = addTo(state.future, latestPast);
    var pastWithoutLatest = withoutLatest(state.past);
    return {
        past: pastWithoutLatest,
        present: calculateState(reducer, pastWithoutLatest),
        future: futureWithLatestPast
    };
}; };
var createRedo = function (reducer) { return function (state, nStates) {
    if (nStates === void 0) { nStates = 1; }
    if (!doNFutureStatesExit(state.future, nStates)) {
        return state;
    }
    var latestFuture = latestFrom(state.future);
    var pastWithLatestFuture = addTo(state.past, latestFuture);
    return {
        past: pastWithLatestFuture,
        present: calculateState(reducer, pastWithLatestFuture),
        future: withoutLatest(state.future)
    };
}; };
var addToHistory = function (_a, newPresent, actions) {
    var past = _a.past, future = _a.future;
    var newPast = addTo(past, actions);
    return {
        past: newPast,
        present: newPresent,
        future: []
    };
};
exports.updateHistory = function (state, newPresent, action, comparator) {
    if (comparator(state.present, newPresent)) {
        return state;
    }
    return addToHistory(state, newPresent, action);
};
var createSelectors = function (reducer) {
    return {
        getPresentState: function (state) { return state.present; },
        getPastStates: function (state) { return state.past.slice(1, state.past.length).map(function (a, i) { return calculateState(reducer, state.past.slice(0, i + 1)); }); },
        getFutureStates: function (state) { return state.future.map(function (a, i) { return calculateState(reducer, state.past.concat(state.future.slice(0, i))); }); }
    };
};
exports.undoable = function (reducer, initAction, comparator) {
    if (initAction === void 0) { initAction = { type: 'INIT' }; }
    if (comparator === void 0) { comparator = function (s1, s2) { return s1 === s2; }; }
    var initialState = {
        past: [initAction],
        present: reducer(undefined, initAction),
        future: []
    };
    var undo = createUndo(reducer);
    var redo = createRedo(reducer);
    // TODO: to function
    var undoableReducer = function (state, action) {
        if (state === void 0) { state = initialState; }
        switch (action.type) {
            case undoable_action_1.UndoableTypes.UNDO:
                return travelNStates(undo, state, action.payload);
            case undoable_action_1.UndoableTypes.REDO:
                return travelNStates(redo, state, action.payload);
            case undoable_action_1.UndoableTypes.GROUP:
                return exports.updateHistory(state, action.payload.reduce(reducer, state.present), action.payload, comparator);
            default:
                return exports.updateHistory(state, reducer(state.present, action), action, comparator);
        }
    };
    return {
        reducer: undoableReducer,
        selectors: createSelectors(reducer)
    };
};
