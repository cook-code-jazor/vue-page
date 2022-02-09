/** !
  * VASPA => Vue Async Single Page Application
  */

import './libs/promise.min'
import Axios from './libs/axios'
import qs from 'qs'
import Vue from './vue/vue.min'
import Store from './vue/vuex.min'
import Router from './vue/vue-router.min'
import RouteGenerator from './libs/route-generator'
import { createComponent, registerComponent } from './libs/cl'
import { wrapper_call } from './libs/utils'
import routeResolver from './libs/routes-resolver'
import createViewParser from './libs/create-view-parser'
Vue.use(Store)
Vue.use(Router)

const addRoutes = Router.prototype.addRoutes
Router.prototype.addRoutes = function (routes) {
  routeResolver(routes)
  addRoutes.call(this, routes)
}

const createVue = (options) => new Vue(options)
const createStore = (options) => new Store(options)
const createRouter = (options) => {
  if (options && options instanceof Array) {
    routeResolver(options)
    return new Router({ routes: options, mode: 'history' })
  }
  options.routes && routeResolver(options.routes)
  return new Router(options)
}
const mergeOptions = (a, b) => {
  for (const k in b) {
    if (!b.hasOwnProperty(k)) continue
    a[k] = b[k]
  }
  return a
}

function createApp (resolve, options) {
  options = options || { viewRoot: '/', viewSuffix: '.html' }

  resolve(createVue, createStore, createRouter, createViewParser(options), Vue)
}

window.quickStart = function (routes, store, options) {
  options = mergeOptions({ viewRoot: '/views', viewSuffix: '.html' }, (typeof routes === 'string' ? store : options) || {})

  const bootstrap = typeof routes === 'string' ? function (createVue, createStore, createRouter, view) {
    const app = view.component(routes)
    createVue({
      el: '#app',
      render: h => h(app)
    })
  } : function (createVue, createStore, createRouter, view) {
    createVue({
      el: '#app',
      router: createRouter(routes),
      store: createStore(store),
      render: h => h('router-view')
    })
  }

  return createApp(bootstrap, options)
}
createApp.require = function (location, argvs) {
  return Axios.get(location).then(res => {
    if (argvs !== undefined && argvs && typeof argvs === 'object') {
      wrapper_call(argvs, res.data)
      return (argvs.hasOwnProperty('module') && argvs.hasOwnProperty('exports')) ? argvs.module.exports : null
    }

    const require = typeof argvs === 'function' ? argvs : null;

    const module = { exports: {}}

    wrapper_call({
      module,
      exports,
      require: function (name) {
        return name === 'vue' ? Vue
          : name === 'axios' ? Axios
            : name === 'qs' ? qs
              : require(name)
      }
    }, res.data)
    return module.exports
  })
}
window.Vue = Vue
window.createApp = createApp
window.createComponent = createComponent
window.registerComponent = registerComponent
window.Route = RouteGenerator()
window.Axios = Axios

/**
 *
 * @param search
 * @param opts：
 * arrayFormat：brackets,comma,indices,repeat
 * indices：true indices, false repeat
 * @returns {string|any}
 */
window.queryString = function (search, opts) {
  if (search && typeof search === 'object') {
    return qs.stringify(search, opts || {})
  }
  return qs.parse(search || (window.location.search ? window.location.substr(1) : ''), opts || {})
}
