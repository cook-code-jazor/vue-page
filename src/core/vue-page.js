/**
  * vue-page v2.0.0
  * @license MIT
  */
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
  var path2regexp = (function() { var c = '/'; var d = './'; var j = new RegExp(['(\\\\.)', '(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?'].join('|'), 'g'); function i(M, E) { var N = []; var x = 0; var v = 0; var G = ''; var q = (E && E.delimiter) || c; var s = (E && E.delimiters) || d; var H = false; var L; while ((L = j.exec(M)) !== null) { var y = L[0]; var t = L[1]; var C = L.index; G += M.slice(v, C); v = C + y.length; if (t) { G += t[1]; H = true; continue } var J = ''; var B = M[v]; var A = L[2]; var p = L[3]; var u = L[4]; var z = L[5]; if (!H && G.length) { var w = G.length - 1; if (s.indexOf(G[w]) > -1) { J = G[w]; G = G.slice(0, w) } } if (G) { N.push(G); G = ''; H = false } var F = J !== '' && B !== undefined && B !== J; var K = z === '+' || z === '*'; var D = z === '?' || z === '*'; var r = J || q; var I = p || u; N.push({ name: A || x++, prefix: J, delimiter: r, optional: D, repeat: K, partial: F, pattern: I ? e(I) : '[^' + f(r) + ']+?' }) } if (G || v < M.length) { N.push(G + M.substr(v)) } return N } function b(q, p) { return n(i(q, p)) } function n(r) { var q = new Array(r.length); for (var p = 0; p < r.length; p++) { if (typeof r[p] === 'object') { q[p] = new RegExp('^(?:' + r[p].pattern + ')$') } } return function(s, w) { var x = ''; var t = (w && w.encode) || encodeURIComponent; for (var u = 0; u < r.length; u++) { var z = r[u]; if (typeof z === 'string') { x += z; continue } var A = s ? s[z.name] : undefined; var y; if (Array.isArray(A)) { if (!z.repeat) { throw new TypeError('Expected "' + z.name + '" to not repeat, but got array') } if (A.length === 0) { if (z.optional) { continue } throw new TypeError('Expected "' + z.name + '" to not be empty') } for (var v = 0; v < A.length; v++) { y = t(A[v], z); if (!q[u].test(y)) { throw new TypeError('Expected all "' + z.name + '" to match "' + z.pattern + '"') }x += (v === 0 ? z.prefix : z.delimiter) + y } continue } if (typeof A === 'string' || typeof A === 'number' || typeof A === 'boolean') { y = t(String(A), z); if (!q[u].test(y)) { throw new TypeError('Expected "' + z.name + '" to match "' + z.pattern + '", but got "' + y + '"') }x += z.prefix + y; continue } if (z.optional) { if (z.partial) { x += z.prefix } continue } throw new TypeError('Expected "' + z.name + '" to be ' + (z.repeat ? 'an array' : 'a string')) } return x } } function f(p) { return p.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1') } function e(p) { return p.replace(/([=!:$/()])/g, '\\$1') } function h(p) { return p && p.sensitive ? '' : 'i' } function l(s, r) { if (!r) { return s } var p = s.source.match(/\((?!\?)/g); if (p) { for (var q = 0; q < p.length; q++) { r.push({ name: q, prefix: null, delimiter: null, optional: false, repeat: false, partial: false, pattern: null }) } } return s } function a(t, q, r) { var s = []; for (var p = 0; p < t.length; p++) { s.push(k(t[p], q, r).source) } return new RegExp('(?:' + s.join('|') + ')', h(r)) } function m(r, p, q) { return o(i(r, q), p, q) } function o(C, w, x) { x = x || {}; var A = x.strict; var s = x.end !== false; var q = f(x.delimiter || c); var r = x.delimiters || d; var t = [].concat(x.endsWith || []).map(f).concat('$').join('|'); var z = ''; var v = false; for (var u = 0; u < C.length; u++) { var B = C[u]; if (typeof B === 'string') { z += f(B); v = u === C.length - 1 && r.indexOf(B[B.length - 1]) > -1 } else { var y = f(B.prefix); var p = B.repeat ? '(?:' + B.pattern + ')(?:' + y + '(?:' + B.pattern + '))*' : B.pattern; if (w) { w.push(B) } if (B.optional) { if (B.partial) { z += y + '(' + p + ')?' } else { z += '(?:' + y + '(' + p + '))?' } } else { z += y + '(' + p + ')' } } } if (s) { if (!A) { z += '(?:' + q + ')?' }z += t === '$' ? '$' : '(?=' + t + ')' } else { if (!A) { z += '(?:' + q + '(?=' + t + '))?' } if (!v) { z += '(?=' + q + '|' + t + ')' } } return new RegExp('^' + z, h(x)) } function k(r, p, q) { if (r instanceof RegExp) { return l(r, p) } if (Array.isArray(r)) { return a((r), p, q) } return m((r), p, q) } var g = k; g.parse = i; g.compile = b; g.tokensToFunction = n; g.tokensToRegExp = o; return g })();
  
  var qs=window["$qs"]=window.qs||(function(){function c(g){if(!g||typeof g!=="string"){return""}return encodeURIComponent(g).replace(/\+/g,"%2B")}function d(g){if(!g){throw new Error("unknown type")}return g.replace(/\[object (.+?)\]/,"$1").toLowerCase()}function f(h,n,k){if(n===null||n===undefined){return""}var l=toString.call(n);var m=d(l);switch(m){case"number":case"boolean":k.push(h+"="+c(n.toString()));return;case"array":for(var g=0;g<n.length;g++){f(h+"["+g+"]",n[g],k)}return;case"object":for(var j in n){if(!n.hasOwnProperty(j)){continue}f(h+"["+j+"]",n[j],k)}return;case"string":k.push(h+"="+c(n))}}function b(i){var h=[];for(var g in i){if(!hasOwnProperty(i,g)){continue}f(g,i[g],h)}return h.join("&")}function a(k,j){var h=k.indexOf("=");if(h===-1){return false}var i=k.substr(0,h);if(!i){return false}var l=k.substr(h);if(l.length===1){j[i]="";return true}l=l.substr(1);try{j[i]=decodeURIComponent(l)}catch(g){j[i]=l}return true}function e(j){var i={};var g=j.indexOf("&");var h;while(g>=0){h=a(j.substr(0,g),i);if(!h){continue}j=j.substr(g+1);g=j.indexOf("&")}if(g===-1){a(j,i)}return i}return{parse:e,stringify:b}})();
  
  (function(){if(!Function.prototype.bind){Function.prototype.bind=function(c){var d=this;return function(){return d.apply(c||null,arguments)}}}if(!String.prototype.startsWith){String.prototype.startsWith=function b(d,c){if(!d){return false}c=c||0;return this.slice(c,c+d.length)===d};String.prototype.endsWith=function a(d,c){if(!d){return false}if(c===undefined){return this.slice(this.length-d.length)===d}return this.slice(c-d.length,c)===d}}if(!Object.keys){Object.keys=function(f){if(!f){return[]}var e=[];if(f instanceof Array){for(var c=0;c<f.length;c++){e.push(c)}}else{if(typeof f==="object"){for(var d in f){if(!hasOwnProperty(f,d)){continue}e.push(d)}}}return e}}if(!Object.merge){Object.merge=function(c,e){if(!e){return c}for(var d in e){if(!hasOwnProperty(e,d)){continue}c[d]=e[d]}return c}}if(!Array.prototype.forEach){Array.prototype.forEach=function(c){if(!c){return}for(var d=0;d<this.length;d++){c.call(this,this[d],d,this)}}}})();

  function hasOwnProperty(obj, attr) {
    return Object.prototype.hasOwnProperty.call(obj, attr)
  }
  var toString = Object.prototype.toString;
  var getType = function(instance){
    return toString.apply(instance).replace(/\[object (.+?)\]/,"$1").toLowerCase()
  }
  
  /** hack axios*/
  var axios_ = (function() {
    var require_cache = {}

    function parseResponse(script) {
      var module = { exports: {}};
      (new Function('module', 'exports', script))(module, module.exports)
      return module.exports
    }
    var axios_ = axios.create({
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    axios_.interceptors.request.use(function(config) {
      if (config.cache !== true) {
        config.headers['Expires'] = 0
        config.headers['Cache-Control'] = 'no-cache'
        config.headers['Pragma'] = 'no-cache'
      }
      return config
    }, function(error) {
      return Promise.reject(error)
    })
    axios_.require = function(url, options) {
      options = options || {}
      var cache_tag = url
      var singlon_cache_tag = cache_tag + '--singlon'
      if (hasOwnProperty(require_cache, cache_tag)) {
        if (hasOwnProperty(options, 'singlon')) {
          return Promise.resolve(require_cache[singlon_cache_tag])
        }
        return Promise.resolve(parseResponse(require_cache[cache_tag]))
      }
      return axios_.get(url).then(function(response) {
        require_cache[cache_tag] = response.data
        require_cache[singlon_cache_tag] = parseResponse(response.data)
        return require_cache[singlon_cache_tag]
      })
    }
    return axios_;
  })();

  
  function keys2params(keys, match) {
    var len = keys.length
    var params = {}; var value = ''
    for (var j = 0; j < len; j++) {
      value = match[j + 1]
      params[keys[j].name] = value
    }
    return params
  }

  function path_split(path, keys) {
    var result = {
      parts: [],
      keys: {}
    }
    var parts = path.split('/')
    if (parts.length === 0) return result

    var keyIndex = 0
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i]

      if (!part || part.substr(0, 1) !== ':') {
        result.parts.push(part)
        continue
      }
      result.parts.push(null)
      result.keys[keys[keyIndex].name] = result.parts.length - 1
      keyIndex++
    }
    return result
  }
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
  function wrapper_call(args, body) {
    var argNames = []
    var argValues = []

    for (var name in args) {
      if (!hasOwnProperty(args, name)) continue
      argNames.push(name)
      argValues.push(args[name])
    }

    return (new Function(argNames, body)).apply(null, argValues)
  }
  function get_hash_url() {
    var hash = window.location.hash
    if (hash && hash.length > 1) return hash.substr(1)
    return ''
  }
  function parse_url(mode, suffix) {
    var url
    if (mode === 'hash') {
      url = get_hash_url()
    } else {
      url = window.location.pathname || ''
    }
    if (!url) url = '/'
    var idx = url.indexOf('?')
    var querystring = ''
    var path = url
    if (idx >= 0) {
      querystring = url.substr(idx + 1)
      path = url.substr(0, idx)
    } else {
      querystring = window.location.search
      querystring = querystring || ''
      if (querystring) {
        querystring = querystring.substr(1)
      }
    }
    if (suffix && path.endsWith(suffix)) {
      path = path.substr(0, path.length - suffix.length)
    }
    return {
      path: path,
      query: qs.parse(querystring),
      url: url
    }
  }
  function parse_attrs(src) {
    var regexp = /<(template|script|style)\b(.*?)(\/)?>/ig; var attrRegexp = /(\w+)="(.+?)"/ig
    var match = regexp.exec(src)
    if (!match) return {}
    var attrs = {}
    var attrString = match[2]

    while ((match = attrRegexp.exec(attrString)) !== null) {
      attrs[match[1]] = match[2]
    }
    return attrs
  }
  function parse_template(src) {
    var regexp = /<(template|script|style)\b(?:.*?)(\/)?>|<\/(template|script|style)>/ig
    var match
    var stacks = []
    var level = 0
    while ((match = regexp.exec(src)) !== null) {
      var name = match[1]; var isEnd = false; var isSelfClose = false
      if (name === undefined) {
        name = match[3]
        isEnd = true
      } else if (match[2]) {
        isSelfClose = true
      }
      if (isEnd) {
        level--
        if (level < 0) throw new Error('template error: tag[' + name + '] not match')
        var last = stacks[stacks.length - 1]
        if (last.name !== name) throw new Error('template error: tag[' + name + '] not match')
        if (level > 0) stacks.pop()
        else {
          last['contentEnd'] = match.index
        }
      } else {
        var attrs = parse_attrs(match[0])
        if (isSelfClose) {
          stacks.push({ name: name, attrs: attrs, level: level + 1, start: match.index, close: true })
        } else {
          level++
          stacks.push({ name: name, attrs: attrs, level: level, start: match.index, close: false, contentStart: match.index + match[0].length })
        }
      }
    }
    var result = {}
    for (var i = 0; i < stacks.length; i++) {
      var stack = stacks[i]
      var tagName = stack.name
      if (stack.level !== 1 || (!stack.close && !hasOwnProperty(stack, 'contentEnd'))) throw new Error('template error: tag[' + tagName + '] not match')
      if (stack.close) continue
      if (!hasOwnProperty(result, tagName)) result[tagName] = { content: '', attrs: stack.attrs }
      var contentLength = stack.contentEnd - stack.contentStart
      if (contentLength === 0) continue
      if (tagName === 'script') {
        result[tagName].content += src.substr(stack.contentStart, contentLength) + '\r\n'
      } else {
        result[tagName].content = src.substr(stack.contentStart, contentLength)
      }
    }
    return result
  }
  function trim(src) {
    if (!src) return src
    return src.replace(/^\s+/, '').replace(/\s+$/, '')
  }
  function merge(a, b) {
    var options = {}
    var key
    for (key in a) {
      if (!hasOwnProperty(a, key)) continue
      options[key] = a[key]
    }
    for (key in b) {
      if (!hasOwnProperty(b, key)) continue
      var value = b[key]
      if (typeof value === 'undefined') continue
      options[key] = value
    }
    return options
  }
  function appendStyles(styles) {
    var head = document.head || document.getElementsByTagName('head')[0]
    var ele = document.createElement('style')
    var appended = false
    ele.type = 'text/css'
    if (!ele.styleSheet) {
      ele.appendChild(document.createTextNode(styles))
      appended = true
    }
    head.appendChild(ele)
    if (ele.styleSheet && !appended) ele.styleSheet.cssText = styles
  }
  function parse_component(app, src, file) {
    var parts = parse_template(src)
    var scriptComponent = hasOwnProperty(parts, 'script') ? parts['script'] : null
    var templateComponent = hasOwnProperty(parts, 'template') ? parts['template'] : null
    var styleComponent = hasOwnProperty(parts, 'style') ? parts['style'] : null

    var script = trim(scriptComponent ? scriptComponent.content : '')
    var template = trim(templateComponent ? templateComponent.content : '')
    var style = trim(styleComponent ? styleComponent.content : '')
    if (!script && !template) {
      return {
        render: function(h) {
          return h('')
        }
      }
    }
    if (style) {
      if (styleComponent && styleComponent.attrs && hasOwnProperty(styleComponent.attrs, 'lang')) {
        var type = styleComponent.attrs['lang']
        if (type === 'less') {
          if (window.less) {
            less.render(style, {compress: true}, function (e, result) {
              if (e) throw e
              appendStyles(result.css)
            })
          }
        }
      } else {
        appendStyles(style)
      }
    }

    var options = null
    var render = null
    try {
      if (template) {
        render = Vue.compile(template)
      }
      if (!script) {
        return {
          render: render.render,
          staticRenderFns: render.staticRenderFns
        }
      }
    }catch (e) {
      console.log(e, template,script)
      throw e;
    }
    if (!script.startsWith('export default')) {
      throw new Error('must export template options from ')
    }
    // 进行简单二次编译
    script = script.replace(/^export default/, 'module.exports = ')
    script = script.replace(/\bimport(?:\()(.+?)(?:\))/ig, 'Component($1)')
    script = script.replace(/^(?:\s*)import(?:\s+)(\w+)(?:\s+)from(?:\s+)(.+?)/ig, 'var $1 = Component($2)')
    var module = { exports: {}}
    var idx = file.lastIndexOf('/'); var dir = ''
    if (idx >= 0) {
      dir = file.substr(0, idx + 1)
    }
    try {
      wrapper_call({
        'module': module,
        'exports': module.exports,
        'App': app,
        'Component': function (file_) {
          file_ = compile_path(dir, file_)
          return app.component(file_, true)
        }
      }, script)
    }catch (e) {
      console.log(e, script)
      throw e;
    }

    options = module.exports
    if (render) {
      options.render = render.render
      options.staticRenderFns = render.staticRenderFns
    }
    return options
  }
  function compile_path(a, b) {
    if (!a) return b
    if (!b) return a
    if (a.substr(a.length - 1) !== '/') a += '/'
    if (b.substr(0, 1) === '/') return b
    return a + b
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
      this.regexp = (path instanceof RegExp) ? path : path2regexp(path, keys)
      this.keys = keys
      this.parts = path_split(path, keys)
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
    // if(!options || !options.bootstrap){
    // 	throw 'no bootstrap';
    // }
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
    return axios_.require(file)
  }
  Application.prototype.getFileContents = function(file) {
    if (this.views) {
      return Promise.resolve(this.views[file])
    }
    file = this.parse(file)
    return axios_.get(file).then(function(response) { return response.data })
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
