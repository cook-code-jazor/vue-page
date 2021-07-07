/** !
  * vue-page v2.0.0
  * @license MIT
  */

import Router from './libs/router'
import Route from './libs/route'
import Application from './libs/application'
import Store from './libs/store'

(function(global, factory) {
  if (!window.Vue) {
    throw new Error('\'Vue\' not import')
  }
  if (!window.axios) {
    throw new Error('\'axios\' not import')
  }
  window.VueView = factory()
}(this || window, function() {
  'use strict'

  var vue_page = {
    Application: Application,
    Store: Store,
    Router: Router,
    Route: Route,
    $router: null,
    $app: null
  }
  vue_page.boot = function(app) {
    if (!(app instanceof Application)) {
      app = new Application(app)
    }
    if (app.mode === 'hash') {
      window.onhashchange = function() {
        if (app.stopRoute !== true) app.route()
      }
    } else {
      window.onpopstate = function() {
        if (app.stopRoute !== true) app.route()
      }
    }
    vue_page.$router = app.router
    vue_page.$app = app
    app.boot()
  }
  return vue_page
}))
