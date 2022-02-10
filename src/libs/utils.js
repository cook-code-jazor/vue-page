
export var toString = Object.prototype.toString

export function compile_path (a, b) {
  if (!a) return b
  if (!b) return a
  if (a.substr(a.length - 1) !== '/') a += '/'
  if (b.substr(0, 1) === '/') return b
  return a + b
}

export function trim (src) {
  if (!src) return src
  return src.replace(/^\s+/, '').replace(/\s+$/, '')
}
export function merge (a, b) {
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
export function hasOwnProperty (obj, attr) {
  return Object.prototype.hasOwnProperty.call(obj, attr)
}

export function getType (instance) {
  return toString.apply(instance).replace(/\[object (.+?)\]/, '$1').toLowerCase()
}

export function deepClone (source) {
  var targetObj = source.constructor === Array ? [] : {}
  Object.keys(source).forEach(function (key) {
    if (source[key] && typeof source[key] === 'object') {
      targetObj[key] = deepClone(source[key])
    } else {
      targetObj[key] = source[key]
    }
  })
  return targetObj
}
export function wrapper_call (args, body) {
  var argNames = []
  var argValues = []

  for (var name in args) {
    if (!hasOwnProperty(args, name)) continue
    argNames.push(name)
    argValues.push(args[name])
  }

  return (new Function(argNames, body)).apply(null, argValues)
}

export default {
  toString,
  trim,
  compile_path,
  merge,
  hasOwnProperty,
  deepClone,
  wrapper_call,
  getType
}
