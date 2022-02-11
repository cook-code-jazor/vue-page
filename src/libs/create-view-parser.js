
import { createComponent } from './cl'
import Vue from '../vue/vue.min'

function viewParser (options = { viewRoot: '/', viewSuffix: '.html' }) {
  const viewRoot = options.viewRoot
  const viewSuffix = options.viewSuffix
  const ctor_ = function (path) {
    return viewRoot + path + viewSuffix
  }
  ctor_.component = function (path, absolute) {
    return createComponent((absolute === true ? path : (viewRoot + path)) + viewSuffix)
  }
  ctor_.registerGlobalComponent = function (name, path, absolute) {
    if (name instanceof Array) {
      for (let i = 0; i < name.length; i++) {
        let args = name[i]
        if (!(args instanceof Array)) args = [args]

        ctor_.registerGlobalComponent.apply(this, args)
      }
      return
    }
    if (arguments.length === 1) {
      path = name
    } else if (arguments.length === 2) {
      if (path === true || path === false) {
        absolute = path
        path = name
      }
    }
    return Vue.component(name, createComponent((absolute === true ? path : (viewRoot + path)) + viewSuffix))
  }
  ctor_.newInstance = function (options = { viewRoot: '/', viewSuffix: '.html' }) {
    return viewParser(options)
  }
  return ctor_
}
export default viewParser
