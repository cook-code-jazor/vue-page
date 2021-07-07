/**!
  * vue-page v2.0.0
  * @license MIT
  */

import qs from './libs/qs'
import axios from './libs/axios'
import {toString, hasOwnProperty, getType, keys2params, parsePath, wrapper_call, parse_url, trim, merge, compile_path} from './libs/utils'
import parse_component from './libs/compiler'

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
  
  function get_route_path(route, params) {
    var parts = route.parts
    var parts_ = parts.parts
    var keys = parts.keys
    for (var key in keys) {
      if (!hasOwnProperty(keys, key)) continue
      if (!hasOwnProperty(params, key)) throw new Error('not provider param [' + key + ']')
      parts_[keys[key]] = params[key]
    }
    return parts_.join('/')
  }
  function Route(name, path, view, router) {
    var keys = []
    this.name = name
    this.label = ''
    this.alias = ''
    this.path = path
    this.sourceRoute = null
    this.meta = null
    if (path === '*') {
      this.regexp = null
      this.keys = []
      this.parts = null
    } else {
      var parsed = parsePath(path);
      this.regexp = parsed.regexp;
      this.keys = parsed.keys
      this.parts = parsed.parts
    }
    this.view = view
    this.viewComponent = null
    this.params = {}
    this.query = {}
    this.router = router
    this.parent = null
    this.routeParent = null
    this.routeParams = null
    this.viewePlaceHolder = null
    this.vue = null
    this.currentView = null
    this.mounted = false
  }
  Route.prototype.loadView = function(mounted) {
    var that = this
    if (typeof this.view === 'function') {
      this.view(function resolve(options) {
        hack_options(that.router.app, options)
        that.viewComponent = options
        that.mount(mounted)
      }, function reject() {})
      return
    }
    if (this.view && typeof this.view === 'object') {
      hack_options(that.router.app, this.view)
      that.viewComponent = this.view
      that.mount(mounted)
      return
    }
    this.router.app.loadVue(this.view).then(function(component_) {
      that.viewComponent = component_
      that.mount(mounted)
    })
  }

  Route.prototype.render = function(mounted) {
    if (this.parent && !this.parent.mounted) {
      var that = this
      this.parent.render(function(parent) {
        that.render()
      })
      return
    }
    if (!this.viewComponent) {
      this.loadView(mounted)
      return
    }
    this.mount(mounted)
  }
  Route.prototype.mount = function(mounted) {
    var router = this.router
    var app = router.app
    this.viewComponent.parent = (this.parent || app).vue
    var view = new Vue(this.viewComponent)
    view.$route = this
    view.$router = router
    view.$app = app
    view.$mount()
    if (!view.$el.getElementsByTagName) {
      throw new Error('did you have a \'v-if\' directive on root element and load async?')
    }
    var views = view.$el.getElementsByTagName ? view.$el.getElementsByTagName('router-view') : []
    if (views.length > 0) {
      this.viewePlaceHolder = views[0]
    }
    this.vue = view
    Application.prototype.display.call(this.parent || app, this)
    this.mounted = true
    mounted && mounted(this)
  }

  Route.prototype.$destroy = function() {
    if (!this.mounted) return
    if (this.currentView) {
      this.currentView.$destroy()
    }
    if (this.vue) {
      this.vue.$destroy()
      this.vue = null
    }
    this.mounted = false
  }

  function get_alias_route(destRoute, sourceRoute) {
    destRoute.sourceRoute = sourceRoute
    return destRoute;
  }
  function Router(app) {
    this.app = app
    this.routes = []
    this.count = 0
    this.routesMap = {}
  }
  Router.prototype.addRoute = function(component, parent, routeParent) {
    if (component instanceof Array) {
      component = {
        name: component[0],
        path: component[1],
        view: component.length > 2 ? component[2] : null
      }
    }
    if (component.name) {
      if (hasOwnProperty(this.routesMap, component.name)) {
        throw new Error('route name has exists with [' + this.routesMap[component.name].path + '] for [' + component.path + ']')
      }
    }
    var route = new Route(component.name, component.path, component.view, this)
    route.parent = parent
    route.alias = component.alias
    route.meta = component.meta
    route.routeParent = routeParent
    route.label = component.label || ''
    route.routeParams = component.params || null
    this.routes.push(route)
    if (component.name) {
      this.routesMap[component.name] = route
    }
    this.count++
    return route
  }

  Router.prototype.match = function(url) {
    var routes = this.routes
    var len = this.count; var route = null; var match = null; var regexp = null; var found = false
    var anyRoute = null
    for (var i = 0; i < len; i++) {
      route = routes[i]
      if (route.path === '*') {
        anyRoute = route
        continue
      }
      regexp = route.regexp
      match = regexp.exec(url)
      if (match) {
        found = true
        break
      }
    }
    if(found && route.alias){
      if(!hasOwnProperty(this.routesMap, route.alias)){
        found = false;
      }else {
        route = get_alias_route(this.routesMap[route.alias], route);
      }
    }
    if (!found) {
      if (!anyRoute) {
        return null
      }
      route = anyRoute
    }
    if (route.keys.length > 0) {
      route.params = keys2params(route.keys, match)
    }
    if (route.routeParams) {
      route.params = merge(route.params, route.routeParams)
    }
    return route
  }
  Router.prototype.resolve = function(data, options) {
    var nameOrPath = typeof data === 'string' ? data : (data.name || '')
    options = typeof data === 'string' ? options : data
    return {
      href: this.parse(nameOrPath, options)
    }
  }
  Router.prototype.parse = function(name, options) {
    var params = (options && options.params) ? options.params : {}
    var query = (options && options.query) ? options.query : {}
    var maps = this.routesMap; var route; var url; var queryString
    if (!name) return null
    if (name.startsWith('/') ||
			name.startsWith('http:') ||
			name.startsWith('https:')) {
      url = name
    } else {
      if (!hasOwnProperty(maps, name)) return null
      route = maps[name]
      url = get_route_path(route, params)
    }
    queryString = qs.stringify(query)
    if (queryString) url += '?' + queryString
    return url
  }

  Router.prototype.push = function(pushData, options, route) {
    var resolved = this.resolve(pushData, options)
    if (!resolved.href) {
      if (typeof pushData === 'object') {
        pushData = pushData.name
      }
      throw new Error('route not found:' + pushData)
    }
    location_to(this.app, resolved.href, false, route !== false, (pushData && pushData.params ? pushData.params: null))
  }
  Router.prototype.replace = function(replaceData, options, route) {
    var resolved = this.resolve(replaceData, options)
    if (!resolved.href) {
      if (typeof replaceData === 'object') {
        replaceData = replaceData.name
      }
      throw new Error('route not found:' + replaceData)
    }
    location_to(this.app, resolved.href, true, route !== false, (replaceData && replaceData.params ? replaceData.params: null))
  }
  Router.prototype.reload = function() {
    this.replace(window.location.toString())
  }

  Router.prototype.route = function(name, options, route) {
    if (!name) name = '/'
    location_to(this.app, this.parse(name, options), false, route !== false)
  }
  Router.prototype.locationTo = function(url, route) {
    location_to(this.app, url, false, route !== false)
  }

  function location_to(app, url, replace, route) {
    if (app.mode === 'hash') {
      if (route === false) app.stopRoute = true
      window.location = '#' + url
      if (route === false) app.stopRoute = false
      return
    }
    if (replace === true) {
      window.history.replaceState({}, null, url)
    } else {
      window.history.pushState({}, null, url)
    }
    if (route !== false) app.route()
  }
  function hack_options(app, options) {
    var beforeCreate = options.beforeCreate
    options.beforeCreate = function() {
      this.$app = app
      this.$router = app.router
      this.$route = app.currentRoute
      beforeCreate && beforeCreate.apply(this, arguments)
    }
  }
  function prepare_components(components){
    var components_ = {};
    for(var i = 0; i < components.length; i++){
      components_[components[i]] = components[i]
    }
    components = components_;
    return components;
  }
  var components_loader = {
    'string' : function(val, app){
      return function(resolve, reject) {
        app.loadVue(val).then(function(options) {
          hack_options(app, options)
          resolve(options)
        })['catch'](reject)
      }
    },
    'function': function(val, app){
      return function(resolve, reject) {
        val(function(options) {
          hack_options(app, options)
          resolve(options)
        }, reject)
      }
    },
    'object': function(val, app){
      return function(resolve, reject) {
        hack_options(app, val)
        resolve(val);
      }
    }
  };

  function register_components(app, components) {
    if (!components) return Promise.resolve(app)
    if (typeof components === 'function') {
      return new Promise(components).then(function(components) {
        return register_components(app, components)
      })
    }
    if(components instanceof Array) components = prepare_components(components);

    for (var name in components) {
      if (!hasOwnProperty(components, name)) continue
      var value = components[name]
      if (!value) continue
      var type = getType(value);
      Vue.component(name, components_loader[type](value, app))
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
    options.viewPath = options.viewPath || '';

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
      return Promise.all([register_components(app, app.options.components), register_routes(app.router, app.options.routes)]).then(res=> app)
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
  function Store(store) {
    this.store = Vue.observable(store)
  }
  Store.prototype.commit = function(name, value) {
    if (typeof name === 'function') {
      name(this.store)
      return
    }
    this.store[name] = value
  }
  Store.prototype.getter = function(names) {
    var result = {}
    var store = this.store
    for (var i = 0; i < names.length; i++) {
      if (!hasOwnProperty(this.store, names[i])) continue
      result[names[i]] = (function(name) {
        return function() {
          return store[name]
        }
      })(names[i])
    }
    return result
  }
  var vue_page = function() {}
  vue_page.Application = Application
  vue_page.Store = Store
  vue_page.Router = Router
  vue_page.Route = Route
  vue_page.$router = null
  vue_page.$app = null
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
