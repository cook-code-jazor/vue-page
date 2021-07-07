import Loader from './bootloader'
import { deepClone } from './utils'

export default {
  install(Vue) {
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
