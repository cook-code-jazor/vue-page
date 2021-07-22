
import qs from './qs'
import { hasOwnProperty, keys2params, merge } from './utils'
import Route from './route'

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
function get_alias_route(destRoute, sourceRoute) {
  destRoute.sourceRoute = sourceRoute
  return destRoute
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
function Router(app) {
  this.app = app
  this.routes = []
  this.count = 0
  this.routesMap = {}
}
Router.prototype.register = function(routes) {
  return register_routes(this, routes)
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
  if (found && route.alias) {
    if (!hasOwnProperty(this.routesMap, route.alias)) {
      found = false
    } else {
      route = get_alias_route(this.routesMap[route.alias], route)
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
  location_to(this.app, resolved.href, false, route !== false, (pushData && pushData.params ? pushData.params : null))
}
Router.prototype.replace = function(replaceData, options, route) {
  var resolved = this.resolve(replaceData, options)
  if (!resolved.href) {
    if (typeof replaceData === 'object') {
      replaceData = replaceData.name
    }
    throw new Error('route not found:' + replaceData)
  }
  location_to(this.app, resolved.href, true, route !== false, (replaceData && replaceData.params ? replaceData.params : null))
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

export default Router
