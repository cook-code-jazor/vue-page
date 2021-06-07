/**
  * vue-page v2.0.0
  * @license MIT
  */
(function(global, factory) {
  if (!window.VueView) {
    throw new Error('\'VueView\' not import')
  }
  VueView.RouterManager = factory()
}(this || window, function() {
  var root = new RouteGroup()
  var stacks = [root]
  function compile_path(a, b) {
    if (!a) return b
    if (!b) return a
    if (a.substr(a.length - 1) !== '/') a += '/'
    if (b.substr(0, 1) === '/') return b
    return a + b
  }
  function RouteGroup() {
    this.rules = []
    this._viewFrom = null
  }
  RouteGroup.prototype.view = function(path) {
    this._viewFrom = path
  }
  RouteGroup.prototype.create = function(parentPath) {
    var result = []
    for (var i = 0; i < this.rules.length; i++) {
      result.push(this.rules[i].create(parentPath, this._viewFrom))
    }
    return result
  }
  function Route(path) {
    var _name = ''
    var _alias = ''
    var _path = path || ''
    var _view = ''
    var _holder = false
    var _params = null
    var _group = null
    var _meta = null
    var _label = ''
    var rule = {
      name: function(name) {
        _name = name
        return this
      },
      alias: function(alias) {
        _alias = alias
        return this
      },
      label: function(label) {
        _label = label
        return this
      },
      params: function(params) {
        _params = params
        return this
      },
      path: function(path) {
        _path = path
        return this
      },
      meta: function(meta) {
        _meta = meta
        return this
      },
      view: function(view, holder) {
        _view = view || _path
        _holder = holder === true
        return this
      },
      group: function(fn) {
        _group = new RouteGroup()
        stacks.push(_group)
        fn()
        stacks.pop()
        return _group
      },
      create: function(parentPath, viewFrom) {
        var path = _path
        if (path.substr(0, 1) !== '/') {
          path = compile_path(parentPath, path)
        }
        var result = { name: _name, alias: _alias, path: path, view: compile_path(viewFrom, _view), label: _label, params: _params, meta: _meta }

        if (!_holder || !result.view) {
          result.withRouterView = false
        }
        if (!result.name) {
          result.name = path.replace(/(^\/)|(\/$)/g, '').replace(/\//g, '.')
        }
        if (_group) {
          result.children = _group.create(result.path)
        }
        return result
      }
    }
    stacks[stacks.length - 1].rules.push(rule)
    return rule
  }
  Route.create = function() {
    return root.create()
  }
  Route.group = function(prefix, fn) {
    return Route(prefix).group(fn)
  }
  return Route
}))
