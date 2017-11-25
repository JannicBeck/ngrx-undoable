"use strict";
exports.__esModule = true;
var Count;
(function (Count) {
    Count["INCREMENT"] = "INCREMENT";
    Count["DECREMENT"] = "DECREMENT";
    Count["INIT"] = "INIT";
})(Count || (Count = {}));
exports.increment = function () {
    return { type: Count.INCREMENT };
};
exports.decrement = function () {
    return { type: Count.DECREMENT };
};
exports.init = function () {
    return { type: Count.INIT };
};
exports.counter = function (state, action) {
    if (state === void 0) { state = 0; }
    switch (action.type) {
        case Count.INCREMENT:
            return state + 1;
        case Count.DECREMENT:
            return state - 1;
        default:
            return state;
    }
};
