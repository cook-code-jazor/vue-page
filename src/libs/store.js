
import { hasOwnProperty } from './utils'
import Vue from 'vue/dist/vue.common.prod'

function Store(store) {
  this.store = Vue.observable(store)
}
Store.prototype.commit = function(name, value) {
  if (typeof name === 'function') {
    name(this.store)
    return
  }
  this.store[name] = value
}
Store.prototype.getter = function(names) {
  var store = this.store
  if(typeof names === 'string'){
    return function () {
      return store[names]
    }
  }
  var result = {}
  if(names && typeof names === 'object'){
    for (var name in names) {
      if (!hasOwnProperty(names, name)) continue
      result[name] = (function(fn) {
          return function() {
            return fn(store)
          }
        })(names[name])
    }
    return result;
  }
  for (var i = 0; i < names.length; i++) {
    if (!hasOwnProperty(this.store, names[i])) continue
    result[names[i]] = (function(name) {
      return function() {
        return store[name]
      }
    })(names[i])
  }
  return result
}

export default Store
