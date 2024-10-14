"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkInstanceof = exports._instanceof = void 0;
var _instanceof = function (leftValue, rightValue) {
    var rightProto = rightValue.prototype;
    leftValue = leftValue.__proto__;
    console.debug('leftValue:', leftValue);
    while (true) {
        if (leftValue === null)
            return false;
        if (leftValue === rightProto)
            return true;
        leftValue = leftValue.__proto__;
    }
};
exports._instanceof = _instanceof;
var checkInstanceof = function (leftValue, rightValue) {
    var newValue = (0, exports._instanceof)(leftValue, rightValue);
    // const originValue = leftValue instanceof rightValue;
    return {
        // isValid:  newValue === originValue,
        newValue: newValue,
        // originValue
    };
};
exports.checkInstanceof = checkInstanceof;
