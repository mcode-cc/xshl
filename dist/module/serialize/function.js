"use strict";

exports.__esModule = true;
exports.serializeFunction = serializeFunction;
exports.deserializeFunction = deserializeFunction;

var _src = require("cross-domain-utils/src");

var _src2 = require("zalgo-promise/src");

var _src3 = require("belter/src");

var _src4 = require("universal-serialize/src");

var _conf = require("../conf");

var _global = require("../global");

var _window = require("./window");

function addMethod(id, val, name, source, domain) {
  const methodStore = (0, _global.windowStore)('methodStore');
  const proxyWindowMethods = (0, _global.globalStore)('proxyWindowMethods');

  if (_window.ProxyWindow.isProxyWindow(source)) {
    proxyWindowMethods.set(id, {
      val,
      name,
      domain,
      source
    });
  } else {
    proxyWindowMethods.del(id); // $FlowFixMe

    const methods = methodStore.getOrSet(source, () => ({}));
    methods[id] = {
      domain,
      name,
      val,
      source
    };
  }
}

function lookupMethod(source, id) {
  const methodStore = (0, _global.windowStore)('methodStore');
  const proxyWindowMethods = (0, _global.globalStore)('proxyWindowMethods');
  const methods = methodStore.getOrSet(source, () => ({}));
  return methods[id] || proxyWindowMethods.get(id);
}

function listenForFunctionCalls({
  on
}) {
  return (0, _global.globalStore)('builtinListeners').getOrSet('functionCalls', () => {
    return on(_conf.MESSAGE_NAME.METHOD, {
      domain: _conf.WILDCARD
    }, ({
      source,
      origin,
      data
    }) => {
      const {
        id,
        name
      } = data;
      const meth = lookupMethod(source, id);

      if (!meth) {
        throw new Error(`Could not find method '${data.name}' with id: ${data.id} in ${(0, _src.getDomain)(window)}`);
      }

      const {
        source: methodSource,
        domain,
        val
      } = meth;
      return _src2.ZalgoPromise.try(() => {
        if (!(0, _src.matchDomain)(domain, origin)) {
          // $FlowFixMe
          throw new Error(`Method '${data.name}' domain ${JSON.stringify((0, _src3.isRegex)(meth.domain) ? meth.domain.source : meth.domain)} does not match origin ${origin} in ${(0, _src.getDomain)(window)}`);
        }

        if (_window.ProxyWindow.isProxyWindow(methodSource)) {
          // $FlowFixMe
          return methodSource.matchWindow(source).then(match => {
            if (!match) {
              throw new Error(`Method call '${data.name}' failed - proxy window does not match source in ${(0, _src.getDomain)(window)}`);
            }
          });
        }
      }).then(() => {
        return val.apply({
          source,
          origin
        }, data.args);
      }, err => {
        return _src2.ZalgoPromise.try(() => {
          if (val.onError) {
            return val.onError(err);
          }
        }).then(() => {
          // $FlowFixMe
          if (err.stack) {
            // $FlowFixMe
            err.stack = `Remote call to ${name}()\n\n${err.stack}`;
          }

          throw err;
        });
      }).then(result => {
        return {
          result,
          id,
          name
        };
      });
    });
  });
}

function serializeFunction(destination, domain, val, key, {
  on
}) {
  listenForFunctionCalls({
    on
  });
  const id = val.__id__ || (0, _src3.uniqueID)();
  destination = _window.ProxyWindow.unwrap(destination);
  const name = val.__name__ || val.name || key;

  if (_window.ProxyWindow.isProxyWindow(destination)) {
    addMethod(id, val, name, destination, domain); // $FlowFixMe

    destination.awaitWindow().then(win => {
      addMethod(id, val, name, win, domain);
    });
  } else {
    addMethod(id, val, name, destination, domain);
  }

  return (0, _src4.serializeType)(_conf.SERIALIZATION_TYPE.CROSS_DOMAIN_FUNCTION, {
    id,
    name
  });
}

function deserializeFunction(source, origin, {
  id,
  name
}, {
  send
}) {
  const getDeserializedFunction = (opts = {}) => {
    function crossDomainFunctionWrapper() {
      let originalStack;

      if (__DEBUG__) {
        originalStack = new Error(`Original call to ${name}():`).stack;
      }

      return _window.ProxyWindow.toProxyWindow(source, {
        send
      }).awaitWindow().then(win => {
        const meth = lookupMethod(win, id);

        if (meth && meth.val !== crossDomainFunctionWrapper) {
          return meth.val.apply({
            source: window,
            origin: (0, _src.getDomain)()
          }, arguments);
        } else {
          // $FlowFixMe
          const options = {
            domain: origin,
            fireAndForget: opts.fireAndForget
          };
          const args = Array.prototype.slice.call(arguments);
          return send(win, _conf.MESSAGE_NAME.METHOD, {
            id,
            name,
            args
          }, options).then(res => {
            if (!opts.fireAndForget) {
              return res.data.result;
            }
          });
        }
      }).catch(err => {
        // $FlowFixMe
        if (__DEBUG__ && originalStack && err.stack) {
          // $FlowFixMe
          err.stack = `${err.stack}\n\n${originalStack}`;
        }

        throw err;
      });
    }

    crossDomainFunctionWrapper.__name__ = name;
    crossDomainFunctionWrapper.__origin__ = origin;
    crossDomainFunctionWrapper.__source__ = source;
    crossDomainFunctionWrapper.__id__ = id;
    crossDomainFunctionWrapper.origin = origin;
    return crossDomainFunctionWrapper;
  };

  const crossDomainFunctionWrapper = getDeserializedFunction();
  crossDomainFunctionWrapper.fireAndForget = getDeserializedFunction({
    fireAndForget: true
  });
  return crossDomainFunctionWrapper;
}