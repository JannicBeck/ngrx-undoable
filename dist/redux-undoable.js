(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global['Redux-Undoable'] = {})));
}(this, (function (exports) { 'use strict';

(function (UndoableTypes) {
    UndoableTypes[UndoableTypes["UNDO"] = 'redux-undoable/UNDO'] = "UNDO";
    UndoableTypes[UndoableTypes["REDO"] = 'redux-undoable/REDO'] = "REDO";
    UndoableTypes[UndoableTypes["GROUP"] = 'redux-undaoble/GROUP'] = "GROUP";
})(exports.UndoableTypes || (exports.UndoableTypes = {}));
var redo = function (nStates) {
    if (nStates === void 0) { nStates = 1; }
    return {
        type: exports.UndoableTypes.REDO,
        payload: nStates
    };
};
var undo = function (nStates) {
    if (nStates === void 0) { nStates = 1; }
    return {
        type: exports.UndoableTypes.UNDO,
        payload: nStates
    };
};
var group = function () {
    var actions = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        actions[_i - 0] = arguments[_i];
    }
    return {
        type: exports.UndoableTypes.GROUP,
        payload: actions
    };
};

var latestFrom = function (x) { return x[x.length - 1]; };
var withoutLatest = function (x) { return x.slice(0, x.length - 1); };
var addTo = function (x, y) { return y ? x.concat([y]) : x; };
var flatten = function (x) { return (_a = []).concat.apply(_a, x); var _a; };
var doNPastStatesExit = function (past, nStates) { return past.length > nStates; };
var doNFutureStatesExit = function (future, nStates) { return future.length >= nStates; };
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
    var past = _a.past;
    var newPast = addTo(past, actions);
    return {
        past: newPast,
        present: newPresent,
        future: []
    };
};
var updateHistory = function (state, newPresent, action, comparator) {
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
var undoable = function (reducer, initAction, comparator) {
    if (initAction === void 0) { initAction = { type: 'INIT' }; }
    if (comparator === void 0) { comparator = function (s1, s2) { return s1 === s2; }; }
    var initialState = {
        past: [initAction],
        present: reducer(undefined, initAction),
        future: []
    };
    var undo$$1 = createUndo(reducer);
    var redo$$1 = createRedo(reducer);
    var undoableReducer = function (state, action) {
        if (state === void 0) { state = initialState; }
        switch (action.type) {
            case exports.UndoableTypes.UNDO:
                return travelNStates(undo$$1, state, action.payload);
            case exports.UndoableTypes.REDO:
                return travelNStates(redo$$1, state, action.payload);
            case exports.UndoableTypes.GROUP:
                return updateHistory(state, action.payload.reduce(reducer, state.present), action.payload, comparator);
            default:
                return updateHistory(state, reducer(state.present, action), action, comparator);
        }
    };
    return {
        reducer: undoableReducer,
        selectors: createSelectors(reducer)
    };
};

exports.redo = redo;
exports.undo = undo;
exports.group = group;
exports.updateHistory = updateHistory;
exports.undoable = undoable;

Object.defineProperty(exports, '__esModule', { value: true });

})));
