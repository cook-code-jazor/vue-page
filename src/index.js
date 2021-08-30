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
Vue.use(Store);
Vue.use(Router);

const addRoutes = Router.prototype.addRoutes
Router.prototype.addRoutes = function(routes) {
  addRoutes.call(this, routes)
}

window.createApp = (resolve) => {
  resolve(Vue, Store, Router)
}
window.createComponent = createComponent
window.registerComponent = registerComponent
window.Route = RouteGenerator()
window.Axios = Axios
window.queryString = function(search) {
  return qs.parse(search || (window.location.search ? window.location.substr(1) : ''))
}
