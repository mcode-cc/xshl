"use strict";

exports.__esModule = true;
exports.RESPONSE_CYCLE_TIME = exports.RES_TIMEOUT = exports.ACK_TIMEOUT_KNOWN = exports.ACK_TIMEOUT = exports.CHILD_WINDOW_TIMEOUT = exports.BRIDGE_TIMEOUT = void 0;
const BRIDGE_TIMEOUT = 5000;
exports.BRIDGE_TIMEOUT = BRIDGE_TIMEOUT;
const CHILD_WINDOW_TIMEOUT = 5000;
exports.CHILD_WINDOW_TIMEOUT = CHILD_WINDOW_TIMEOUT;
const ACK_TIMEOUT = 2000;
exports.ACK_TIMEOUT = ACK_TIMEOUT;
const ACK_TIMEOUT_KNOWN = 10000;
exports.ACK_TIMEOUT_KNOWN = ACK_TIMEOUT_KNOWN;
const RES_TIMEOUT = __TEST__ ? 2000 : -1;
exports.RES_TIMEOUT = RES_TIMEOUT;
const RESPONSE_CYCLE_TIME = 500;
exports.RESPONSE_CYCLE_TIME = RESPONSE_CYCLE_TIME;