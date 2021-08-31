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

window.createApp = (resolve, options = { viewRoot: '/', viewSuffix: '.html' }) => {
  const viewParser = createViewParser(options)

  resolve(createVue, createStore, createRouter, viewParser)
}
window.createComponent = createComponent
window.registerComponent = registerComponent
window.Route = RouteGenerator()
window.Axios = Axios
window.queryString = function (search) {
  if (search && typeof search === 'object') {
    return qs.stringify(search)
  }
  return qs.parse(search || (window.location.search ? window.location.substr(1) : ''))
}
