
import path2regexp from './path2regexp'
import qs from './qs'

export var toString = Object.prototype.toString;


export function hack_options(app, options) {
  var beforeCreate = options.beforeCreate
  options.beforeCreate = function() {
    this.$app = app
    this.$router = app.router
    this.$route = app.currentRoute
    beforeCreate && beforeCreate.apply(this, arguments)
  }
}
export function compile_path(a, b) {
  if (!a) return b
  if (!b) return a
  if (a.substr(a.length - 1) !== '/') a += '/'
  if (b.substr(0, 1) === '/') return b
  return a + b
}

export function trim(src) {
  if (!src) return src
  return src.replace(/^\s+/, '').replace(/\s+$/, '')
}
export function merge(a, b) {
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
export function hasOwnProperty(obj, attr) {
  return Object.prototype.hasOwnProperty.call(obj, attr)
}

export function getType(instance){
  return toString.apply(instance).replace(/\[object (.+?)\]/,"$1").toLowerCase()
}

export function keys2params(keys, match) {
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
export function parsePath(path){
  
  var keys = []
  var regexp = (path instanceof RegExp) ? path : path2regexp(path, keys)
  var parts = path_split(path, keys)

  return {regexp, keys, parts}
}

export function wrapper_call(args, body) {
  var argNames = []
  var argValues = []

  for (var name in args) {
    if (!hasOwnProperty(args, name)) continue
    argNames.push(name)
    argValues.push(args[name])
  }

  return (new Function(argNames, body)).apply(null, argValues)
}

export function get_hash_url() {
  var hash = window.location.hash
  if (hash && hash.length > 1) return hash.substr(1)
  return ''
}

export function parse_url(mode, suffix) {
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