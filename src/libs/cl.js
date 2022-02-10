
import axios from './axios'
import { hasOwnProperty, compile_path, wrapper_call, trim } from './utils'
import { parse_template, appendStyles } from './compiler'
import Vue from '../vue/vue.min'

if (!String.prototype.startsWith) {
  // eslint-disable-next-line no-extend-native
  String.prototype.startsWith = function b (d, c) {
    if (!d) {
      return false
    }
    c = c || 0
    return this.slice(c, c + d.length) === d
  }
  // eslint-disable-next-line no-extend-native
  String.prototype.endsWith = function a (d, c) {
    if (!d) {
      return false
    }
    if (c === undefined) {
      return this.slice(this.length - d.length) === d
    }
    return this.slice(c - d.length, c) === d
  }
}
if (!Object.merge) {
  Object.merge = function (c, e) {
    if (!e) {
      return c
    }
    for (var d in e) {
      if (!hasOwnProperty(e, d)) {
        continue
      }
      c[d] = e[d]
    }
    return c
  }
}
function parse_component (src, file) {
  var parts = parse_template(src)
  var scriptComponent = hasOwnProperty(parts, 'script') ? parts['script'] : null
  var templateComponent = hasOwnProperty(parts, 'template') ? parts['template'] : null
  var styleComponent = hasOwnProperty(parts, 'style') ? parts['style'] : null

  var script = trim(scriptComponent ? scriptComponent.content : '')
  var template = trim(templateComponent ? templateComponent.content : '')
  var style = trim(styleComponent ? styleComponent.content : '')
  if (!script && !template) {
    return {
      render: function (h) {
        return h('')
      }
    }
  }
  if (style) {
    appendStyles(style)
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
  } catch (e) {
    throw e
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
      'Component': function (file_) {
        file_ = compile_path(dir, file_)
        return function (resolve, reject) {
          getComponentContents(file_).then(function (res) {
            if (!res) return
            resolve(parse_component(res, file_))
          })
        }
      }
    }, script)
  } catch (e) {
    throw e
  }

  options = module.exports
  if (render) {
    options.render = render.render
    options.staticRenderFns = render.staticRenderFns
  }
  return options
}
var CACHES__ = {}
function getComponentContents ($url, options) {
  if (CACHES__.hasOwnProperty($url) && CACHES__[$url]) {
    return Promise.resolve(CACHES__[$url])
  }
  return axios.get($url, Object.merge({
    responseType: 'text',
    ignoreInterceptors: true
  }, options.axios || {})).then(function (response) {
    if (response.status >= 400 || !response.data) return null
    return CACHES__[$url] = response.data
  }).catch(res => null)
}
export function registerComponent (name, value, options) {
  if (value === undefined) value = name
  if (!value) return
  if (typeof value === 'function' || typeof value === 'object') {
    Vue.component(name, value)
    return
  }
  if (typeof value === 'string') {
    Vue.component(name, createComponent(value, options))
    return
  }
  throw new Error('不支持的数据类型')
}
export function createComponent (file, options) {
  return function (resolve, reject) {
    getComponentContents(file, options || {}).then(function (res) {
      if (!res) {
        reject && reject()
        return
      }
      resolve(parse_component(res, file))
    })
  }
}
