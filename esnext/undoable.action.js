export var UndoableTypes;
(function (UndoableTypes) {
    UndoableTypes["UNDO"] = "redux-undoable/UNDO";
    UndoableTypes["REDO"] = "redux-undoable/REDO";
    UndoableTypes["GROUP"] = "redux-undaoble/GROUP";
})(UndoableTypes = UndoableTypes || (UndoableTypes = {}));
/*
 * action creators
 */
export var redo = function (nStates) {
    if (nStates === void 0) { nStates = 1; }
    return {
        type: UndoableTypes.REDO,
        payload: nStates
    };
};
export var undo = function (nStates) {
    if (nStates === void 0) { nStates = 1; }
    return {
        type: UndoableTypes.UNDO,
        payload: nStates
    };
};
export var group = function () {
    var actions = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        actions[_i] = arguments[_i];
    }
    return {
        type: UndoableTypes.GROUP,
        payload: actions
    };
};
