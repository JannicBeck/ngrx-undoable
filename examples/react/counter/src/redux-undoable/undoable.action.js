"use strict";
exports.__esModule = true;
var UndoableTypes;
(function (UndoableTypes) {
    UndoableTypes["UNDO"] = "redux-undoable/UNDO";
    UndoableTypes["REDO"] = "redux-undoable/REDO";
    UndoableTypes["GROUP"] = "redux-undaoble/GROUP";
})(UndoableTypes = exports.UndoableTypes || (exports.UndoableTypes = {}));
/*
 * action creators
 */
exports.redo = function (nStates) {
    if (nStates === void 0) { nStates = 1; }
    return {
        type: UndoableTypes.REDO,
        payload: nStates
    };
};
exports.undo = function (nStates) {
    if (nStates === void 0) { nStates = 1; }
    return {
        type: UndoableTypes.UNDO,
        payload: nStates
    };
};
exports.group = function () {
    var actions = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        actions[_i] = arguments[_i];
    }
    return {
        type: UndoableTypes.GROUP,
        payload: actions
    };
};
