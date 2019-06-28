"use strict";

exports.__esModule = true;
exports.on = on;
exports.once = once;

var _src = require("zalgo-promise/src");

var _drivers = require("../drivers");

var _conf = require("../conf");

function on(name, options, handler) {
  if (!name) {
    throw new Error('Expected name');
  }

  if (typeof options === 'function') {
    handler = options; // $FlowFixMe

    options = {};
  }

  if (!handler) {
    throw new Error('Expected handler');
  }

  options = options || {};
  options.name = name;
  options.handler = handler || options.handler;
  const win = options.window;
  const domain = options.domain;
  const listenerOptions = {
    handler: options.handler,
    handleError: options.errorHandler || (err => {
      throw err;
    }),
    window: win,
    domain: domain || _conf.WILDCARD,
    name
  };
  const requestListener = (0, _drivers.addRequestListener)({
    name,
    win,
    domain
  }, listenerOptions);
  return {
    cancel() {
      requestListener.cancel();
    }

  };
}

function once(name, options, handler) {
  // $FlowFixMe
  options = options || {};

  if (typeof options === 'function') {
    handler = options; // $FlowFixMe

    options = {};
  }

  const promise = new _src.ZalgoPromise();
  let listener; // eslint-disable-line prefer-const

  options.errorHandler = err => {
    listener.cancel();
    promise.reject(err);
  };

  listener = on(name, options, event => {
    listener.cancel();
    promise.resolve(event);

    if (handler) {
      return handler(event);
    }
  });
  promise.cancel = listener.cancel;
  return promise;
}