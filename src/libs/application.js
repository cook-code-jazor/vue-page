
import axios from './axios'
import { hasOwnProperty, parse_url, compile_path, hack_options, getType } from './utils'
import Router from './router'
import Store from './store'
import parse_component from './compiler'
import Vue from 'vue/dist/vue.common.prod'

function prepare_components(components) {
  var components_ = {}
  for (var i = 0; i < components.length; i++) {
    components_[components[i]] = components[i]
  }
  components = components_
  return components
}
var components_loader = {
  'string': function(val, app) {
    return function(resolve, reject) {
      app.loadVue(val).then(function(options) {
        hack_options(app, options)
        resolve(options)
      })['catch'](reject)
    }
  },
  'function': function(val, app) {
    return function(resolve, reject) {
      val(function(options) {
        hack_options(app, options)
        resolve(options)
      }, reject)
    }
  },
  'object': function(val, app) {
    return function(resolve, reject) {
      hack_options(app, val)
      resolve(val)
    }
  }
}

function register_components(app, components) {
  if (!components) return Promise.resolve(app)
  if (typeof components === 'function') {
    return new Promise(components).then(function(components) {
      return register_components(app, components)
    })
  }
  if (components instanceof Array) components = prepare_components(components)
  for (var name in components) {
    if (!hasOwnProperty(components, name)) continue
    var value = components[name]
    if (!value) continue
    var type = getType(value)
    var component_ = components_loader[type](value, app)
    Vue.component(name, component_)
  }
  return Promise.resolve(app)
}
var __vue_cache = {}
function load_as_vue(app, file) {
  if (hasOwnProperty(__vue_cache, file)) {
    return new Promise(function(resolved, reject) {
      resolved(__vue_cache[file])
    })
  }
  return app.getFileContents(file).then(function(res) {
    __vue_cache[file] = parse_component(app, res, file)
    return __vue_cache[file]
  })
}
function register_routes(router, routes) {
  if (!routes) {
    return Promise.resolve(router.app)
  }
  if (typeof routes === 'string') {
    return router.app.require(routes).then(function(routes) {
      return register_routes(router, routes)
    })
  }
  if (typeof routes === 'function') {
    return new Promise(routes).then(function(routes) {
      return register_routes(router, routes)
    })
  }
  function parse(routes, parent, routeParent) {
    for (var i = 0; i < routes.length; i++) {
      var route = router.addRoute(routes[i], parent, routeParent)
      var children = routes[i].children
      if (children && children.length > 0) {
        parse(children, routes[i].withRouterView === false ? parent : route, route)
      }
    }
  }
  parse(routes, null, null)
  return Promise.resolve(router.app)
}

function Application(options) {
  this.options = options = options || {}
  options.componentExtension = options.componentExtension || '.vue'
  options.viewPath = options.viewPath || ''

  var root = options.root

  this.views = hasOwnProperty(options, 'views') ? options.views : null
  this.router = new Router(this)

  this.root = root || ''
  this.store = options.store || new Store({})
  this.mode = options.mode || 'history'
  if (!window.history.pushState) {
    this.mode = 'hash'
  }
  options.el = options.el || (function() {
    var el = document.createElement('div')
    document.body.appendChild(el)
    return el
  })()
  this.el = options.el
  this.viewePlaceHolder = null
  this.currentView = null
  this.currentRoute = null
  this.stopRoute = false
}
Application.prototype.parse = function(path) {
  if (path.substr(0, 1) === '/') {
    return path
  }
  return this.root + '/' + path
}
Application.prototype.require = function(file) {
  if (this.views) {
    var module = { exports: {}};
    (new Function('module', 'exports', this.views[file]))(module, module.exports)
    return Promise.resolve(module.exports)
  }
  file = this.parse(file)
  return axios.require(file)
}
Application.prototype.getFileContents = function(file) {
  if (this.views) {
    return Promise.resolve(this.views[file])
  }
  file = this.parse(file)
  return axios.get(file).then(function(response) { return response.data })
}
Application.prototype.loadVue = function(file) {
  if (hasOwnProperty(this.options, 'viewPath')) {
    file = compile_path(this.options['viewPath'], file)
  }
  return load_as_vue(this, file + this.options.componentExtension)
}
Application.prototype.component = function(file, ignoreViewPath) {
  if (ignoreViewPath !== true) {
    if (hasOwnProperty(this.options, 'viewPath')) {
      file = compile_path(this.options['viewPath'], file)
    }
  }
  var that = this
  return function(resolve, reject) {
    load_as_vue(this, file + this.options.componentExtension).then(function(res) {
      hack_options(that, res)
      resolve(res)
    })['catch'](reject)
  }.bind(this)
}
Application.prototype.boot = function() {
  var promise
  var _this = this
  if (typeof this.store === 'string') {
    promise = this.require(this.store).then(function(options) {
      _this.store = new Store(options)
      return _this
    })
  } else {
    promise = Promise.resolve(this)
  }

  promise = promise.then(function(app) {
    return Promise.all([register_components(app, app.options.components), register_routes(app.router, app.options.routes)]).then(res => app)
  })
  if (this.options.bootstrap) {
    promise.then(function(app) {
      return app.loadVue(app.options.bootstrap)
    }).then(function(options) {
      _this.mount(options)
    })
  } else {
    promise.then(function(app) {
      app.mount(null)
    })
  }

  return this
}
Application.prototype.mount = function(options) {
  if (!options) {
    this.viewePlaceHolder = this.el
    if (this.options.mounted) {
      this.options.mounted.call(this, vue)
    }
    this.route()
    return
  }
  var vue = new Vue(options)
  vue.$route = null
  vue.$router = this.router
  vue.$app = this
  vue.$mount()
  this.el.parentNode.replaceChild(vue.$el, this.el)
  var views = vue.$el.getElementsByTagName('router-view')
  if (views.length === 0) {
    return
  }
  this.viewePlaceHolder = views[0]
  this.vue = vue
  if (this.options.mounted) {
    this.options.mounted.call(this, vue)
  }
  this.route()
}
Application.prototype.display = function(route) {
  if (!this.viewePlaceHolder) {
    throw new Error('no view placeholder')
  }
  var vue = route.vue
  this.viewePlaceHolder.parentNode.replaceChild(vue.$el, this.viewePlaceHolder)
  this.viewePlaceHolder = vue.$el
  if (this.currentView && this.currentView !== route) {
    this.currentView.$destroy()
  }
  this.currentView = route
}
Application.prototype.route = function() {
  var request = parse_url(this.mode, hasOwnProperty(this.options, 'suffix') ? this.options.suffix : null)
  var route = this.router.match(request.path)
  if (!route) throw new Error('route not found')
  this.currentRoute = route
  route.query = request.query
  route.render()
}

export default Application
