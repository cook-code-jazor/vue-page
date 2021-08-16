
import axios from './axios'
import { hasOwnProperty, parse_url, compile_path, hack_options, getType } from './utils'
import Router from './router'
import Store from './store'
import parse_component from './compiler'
import Vue from 'vue/dist/vue.common.prod'
import Route from './route'

function prepare_components(components) {
  const components_ = {}
  for (let i = 0; i < components.length; i++) {
    components_[components[i]] = components[i]
  }
  components = components_
  return components
}

const components_loader = {
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
  for (const name in components) {
    if (!hasOwnProperty(components, name)) continue
    const value = components[name]
    if (!value) continue
    const type = getType(value)
    const component_ = components_loader[type](value, app)
    Vue.component(name, component_)
  }
  return Promise.resolve(app)
}

const __vue_cache = {}

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

function Application(options) {
  this.options = options = options || {}
  options.componentExtension = options.componentExtension || '.vue'
  options.viewPath = options.viewPath || ''

  const root = options.root

  this.views = hasOwnProperty(options, 'views') ? options.views : null
  this.router = new Router(this)

  this.root = root || ''
  this.store = options.store || new Store({})
  this.mode = options.mode || 'history'
  if (!window.history.pushState) {
    this.mode = 'hash'
  }
  options.el = options.el || (function() {
    const el = document.createElement('div')
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
Application.prototype.register = function(components) {
  return register_components(this, components)
}
Application.prototype.registerWhenBoot = function() {
  return register_components(this, this.options.components)
}
Application.prototype.require = function(file) {
  if (this.views) {
    const module = { exports: {}};
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
  const that = this
  return function(resolve, reject) {
    load_as_vue(this, file + this.options.componentExtension).then(function(res) {
      hack_options(that, res)
      resolve(res)
    })['catch'](reject)
  }.bind(this)
}
Application.prototype.boot = function() {
  let promise
  const _this = this
  if (typeof this.store === 'string') {
    promise = this.require(this.store).then(function(options) {
      _this.store = new Store(options)
      return _this
    })
  } else {
    promise = Promise.resolve(this)
  }

  promise = promise.then(function(app) {
    return Promise.all([
      app.registerWhenBoot(),
      app.router.register(app.options.routes)
    ]).then(res => app)
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
  vue.$store = this.store
  vue.$app = this
  vue.$mount()
  this.el.parentNode.replaceChild(vue.$el, this.el)
  const views = vue.$el.getElementsByTagName('router-view')
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
    if (this instanceof Route) {
      Application.prototype.display.call(this.parent || route.app, route)
      return
    }
    throw new Error('no view placeholder')
  }
  const vue = route.vue
  this.viewePlaceHolder.parentNode.replaceChild(vue.$el, this.viewePlaceHolder)
  this.viewePlaceHolder = vue.$el
  if (this.currentView && this.currentView !== route) {
    this.currentView.$destroy()
  }
  this.currentView = route
}
Application.prototype.route = function() {
  function goto_(app, request) {
    const route = app.router.match(request.path)
    if (!route) throw new Error('route not found')

    function setAndRoute(route) {
      app.currentRoute = route
      app.currentRoute.query = request.query
      app.currentRoute.render()
    }
    if (app.options.beforeRoute) {
      app.options.beforeRoute.call(app, app.currentRoute, route, (nextRoute) => {
        setAndRoute(nextRoute || route)
      })
      return
    }
    setAndRoute(route)
  }
  const request = parse_url(this.mode, hasOwnProperty(this.options, 'suffix') ? this.options.suffix : null)
  if (this.options.beforeMatch) {
    this.options.beforeMatch.call(this, request, () => {
      goto_(this, request)
    })
    return
  }
  goto_(this, request)
}

export default Application
