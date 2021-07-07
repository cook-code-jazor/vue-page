import Application from './application'
import Store from './store'
import Router from './router'
import Route from './route'
import RouteGenerator from './route-generator'
import Vue from 'vue/dist/vue.common.prod'

const Loader = {
  Application: Application,
  RG: RouteGenerator,
  Store: Store,
  Router: Router,
  Route: Route,
  $router: null,
  $app: null
}
Loader.use = function(installer) {
  const args = [Vue]
  if (arguments.length > 1) {
    const extArgs = Array.prototype.slice.call(arguments, 1)
    Array.prototype.push.apply(args, extArgs)
  }
  installer.install.apply(installer, args)
}
Loader.boot = function(app) {
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
  Loader.$router = app.router
  Loader.$app = app
  app.boot()
}

export default Loader
