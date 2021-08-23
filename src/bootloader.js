import Application from './libs/application'
import Store from './libs/store'
import Router from './libs/router'
import Route from './libs/route'
import RouteGenerator from './libs/route-generator'
import Vue from './vue/vue.min'

const Loader = {
  Application: Application,
  RG: RouteGenerator,
  Store: Store,
  Router: Router,
  Route: Route,
  $router: null,
  $app: null,
  $vue: Vue
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
