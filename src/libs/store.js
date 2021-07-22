
import { hasOwnProperty } from './utils'
import Vue from 'vue/dist/vue.common.prod'

function Store(store) {
  this.store = store
  this.actions = store.actions || {}
  this.commits = store.commits || {}
  this.state = Vue.observable(store.state)
}
Store.prototype.commit = function(name, payload) {
  if (!this.commits.hasOwnProperty(name)) throw new Error('commits[' + name + '] not found')
  this.commits[name](this, payload)
}
Store.prototype.dispatch = function(name, payload) {
  if (!this.actions.hasOwnProperty(name)) throw new Error('actions[' + name + '] not found')
  return this.actions[name](this, payload)
}
Store.prototype.getter = function(names) {
  const store = this.state
  if (typeof names === 'string') {
    return function() {
      return store[names]
    }
  }
  const result = {}
  if (names && typeof names === 'object' && !(names instanceof Array)) {
    for (var name in names) {
      if (!hasOwnProperty(names, name)) continue
      result[name] = (function(fn) {
        return function() {
          return fn(store)
        }
      })(names[name])
    }
    return result
  }
  if (!(names instanceof Array)) { return result }

  for (let i = 0; i < names.length; i++) {
    if (!hasOwnProperty(store, names[i])) continue
    result[names[i]] = (function(name) {
      return function() {
        return store[name]
      }
    })(names[i])
  }
  return result
}

export default Store
