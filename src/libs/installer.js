import Loader from '../bootloader'
import { deepClone, hasOwnProperty } from './utils'

export default {
  install(Vue) {
    if (!Function.prototype.bind) {
      Function.prototype.bind = function(c) {
        var d = this
        return function() {
          return d.apply(c || null, arguments)
        }
      }
    }
    if (!String.prototype.startsWith) {
      String.prototype.startsWith = function b(d, c) {
        if (!d) {
          return false
        }
        c = c || 0
        return this.slice(c, c + d.length) === d
      }
      String.prototype.endsWith = function a(d, c) {
        if (!d) {
          return false
        }
        if (c === undefined) {
          return this.slice(this.length - d.length) === d
        }
        return this.slice(c - d.length, c) === d
      }
    }
    if (!Object.keys) {
      Object.keys = function(f) {
        if (!f) {
          return []
        }
        var e = []
        if (f instanceof Array) {
          for (var c = 0; c < f.length; c++) {
            e.push(c)
          }
        } else {
          if (typeof f === 'object') {
            for (var d in f) {
              if (!hasOwnProperty(f, d)) {
                continue
              }
              e.push(d)
            }
          }
        }
        return e
      }
    }
    if (!Object.merge) {
      Object.merge = function(c, e) {
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
    if (!Array.prototype.forEach) {
      Array.prototype.forEach = function(c) {
        if (!c) {
          return
        }
        for (var d = 0; d < this.length; d++) {
          c.call(this, this[d], d, this)
        }
      }
    }

    Vue.prototype.$deepClone = deepClone

    Vue.component('RouterLink', {
      props: {
        tag: { type: String, default: 'a' },
        to: { type: String, required: true },
        target: { type: String, default: '_self' },
        title: { type: String, default: '' },
        useLocation: { type: Boolean, default: false },
        openNew: { type: Boolean, default: false },
        params: { type: Object, default: null },
        query: { type: Object, default: null }
      },
      render: function(h) {
        if (!this.to) throw new Error('prop \'to\' is required')
        var _this = this
        var options = { domProps: {}, on: {}}
        var pushData = { name: this.to, query: this.query, params: this.params }
        if (this.title && this.tag === 'a') {
          options.domProps['title'] = this.title
        }
        if (this.useLocation) {
          if (this.tag !== 'a') {
            throw new Error('can not set "use-location" attr on tag "a"')
          }
          var resolved = Loader.$router.resolve(pushData)
          options.domProps['href'] = resolved.href
          if (this.target !== '_self')options.domProps['target'] = this.target
          if (this.openNew) {
            options.domProps['target'] = '_blank'
          }
        } else {
          if (this.tag === 'a') options.domProps['href'] = 'javascript:void(0)'
          options.on['click'] = function() {
            _this.$emit('click', arguments)
            if (_this.openNew || _this.target === '_blank') {
              var resolved = Loader.$router.resolve(pushData)
              window.open(resolved.href)
            } else {
              Loader.$router.push(pushData)
            }
          }
        }
        return h(this.tag, options, this.$slots.default)
      }
    })
  }
}
