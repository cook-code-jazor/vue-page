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

const addRoutes = Router.prototype.addRoutes
Router.prototype.addRoutes = function(routes) {
  addRoutes.call(this, routes)
}

window.CreateApp = (resolve) => {
  resolve(Vue, Store, Router)
}
window.Route = RouteGenerator()
window.Axios = Axios
window.QueryString = function(search) {
  return qs.parse(search || (window.location.search ? window.location.substr(1) : ''))
}
