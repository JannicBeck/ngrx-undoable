// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

require = (function (modules, cache, entry) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof require === "function" && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof require === "function" && require;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      function localRequire(x) {
        return newRequire(localRequire.resolve(x));
      }

      localRequire.resolve = function (x) {
        return modules[name][1][x] || x;
      };

      var module = cache[name] = new newRequire.Module;
      modules[name][0].call(module.exports, localRequire, module, module.exports);
    }

    return cache[name].exports;
  }

  function Module() {
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  // Override the current require with this new one
  return newRequire;
})({4:[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var e;!function(e){e.UNDO="redux-undoable/UNDO",e.REDO="redux-undoable/REDO",e.GROUP="redux-undaoble/GROUP"}(e=exports.UndoableTypes||(exports.UndoableTypes={})),exports.redo=function(o){return void 0===o&&(o=1),{type:e.REDO,payload:o}},exports.undo=function(o){return void 0===o&&(o=1),{type:e.UNDO,payload:o}},exports.group=function(){for(var o=[],r=0;r<arguments.length;r++)o[r]=arguments[r];return{type:e.GROUP,payload:o}};
},{}],3:[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var t=require("./undoable.action"),e=function(t){return t[t.length-1]},n=function(t){return t.slice(0,t.length-1)},r=function(t,e){return e?t.concat([e]):t},u=function(t){return[].concat.apply([],t)},o=function(t,e){return u(e).reduce(t,void 0)},s=function(t,e,n){return 0===e?t:s(n(t,e),--e,n)},c=function(t,e,n,u){return u(t.present,e)?t:function(t,e,n){var u=t.past;t.future;return{past:r(u,n),present:e,future:[]}}(t,e,n)},a=function(u,a,i){var f={past:[a],present:u(void 0,a),future:[]},p=function(t){return function(u,s){if(void 0===s&&(s=1),!function(t,e){return t.length>e}(u.past,s))return u;var c=e(u.past),a=r(u.future,c),i=n(u.past);return{past:i,present:o(t,i),future:a}}}(u),l=function(t){return function(u,s){if(void 0===s&&(s=1),!function(t,e){return t.length>=e}(u.future,s))return u;var c=e(u.future),a=r(u.past,c);return{past:a,present:o(t,a),future:n(u.future)}}}(u);return function(e,n){switch(void 0===e&&(e=f),n.type){case t.UndoableTypes.UNDO:return s(e,n.payload,p);case t.UndoableTypes.REDO:return s(e,n.payload,l);case t.UndoableTypes.GROUP:return c(e,n.payload.reduce(u,e.present),n.payload,i);default:return c(e,u(e.present,n),n,i)}}};exports.undoable=function(t,e,n){return void 0===e&&(e={type:"INIT"}),void 0===n&&(n=function(t,e){return t===e}),{reducer:a(t,e,n),selectors:function(t){return{getPastStates:function(e){return e.past.slice(1,e.past.length).map(function(n,r){return o(t,e.past.slice(0,r+1))})},getPresentState:function(t){return t.present},getFutureStates:function(e){return e.future.slice().reverse().map(function(n,r){return o(t,e.past.concat(e.future.slice().reverse().slice(0,r+1)))})},getPastActions:function(t){return u(t.past)},getLatestAction:function(t){return u(t.past)[0]},getFutureActions:function(t){return u(t.future.slice().reverse())}}}(t)}};
},{"./undoable.action":4}],5:[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0});
},{}],1:[function(require,module,exports) {
"use strict";function e(e){for(var r in e)exports.hasOwnProperty(r)||(exports[r]=e[r])}Object.defineProperty(exports,"__esModule",{value:!0}),e(require("./src/interfaces/public")),e(require("./src/undoable.action")),e(require("./src/undoable.reducer"));
},{"./src/undoable.reducer":3,"./src/undoable.action":4,"./src/interfaces/public":5}]},{},[1])