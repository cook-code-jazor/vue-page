
import { parsePath, hack_options } from './utils'
import Application from './application'
import Vue from 'vue/dist/vue.common.prod'

function Route(name, path, view, router) {
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
    var parsed = parsePath(path)
    this.regexp = parsed.regexp
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
    }, function reject() { })
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
  view.$store = app.store
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

export default Route
