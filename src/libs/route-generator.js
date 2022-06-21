
function compile_path (a, b) {
  if (!a) return b
  if (!b) return a
  if (a.substr(a.length - 1) !== '/') a += '/'
  if (b.substr(0, 1) === '/') return b
  return a + b
}
function RouteGroup () {
  this.rules = []
}
RouteGroup.prototype.create = function (parentPath) {
  const result = []
  for (let i = 0; i < this.rules.length; i++) {
    result.push(this.rules[i].create(parentPath))
  }
  return result
}

function __constructor () {
  function Route (path, component, redirectTo) {
    let _name = ''
    let _alias = ''
    let _component = component || null
    let _components = null
    let _path = path || ''
    let _group = null
    let _redirect = redirectTo || null
    let _props = false
    let _meta = null
    const rule = {
      name: function (name) {
        _name = name
        return this
      },
      alias: function (alias) {
        _alias = alias
        return this
      },
      component: function (component) {
        _component = component
        return this
      },
      redirect: function (redirect) {
        _redirect = redirect
        return this
      },
      props: function (props) {
        _props = props === undefined ? true : props
        return this
      },
      components: function (components) {
        _components = components
        return this
      },
      path: function (path) {
        _path = path
        return this
      },
      meta: function (meta) {
        _meta = meta
        return this
      },
      setMeta: function (key, value) {
        if (value === undefined) return this
        if (!_meta) _meta = {}
        _meta[key] = value
        return this
      },
      group: function (fn) {
        _group = new RouteGroup()
        stacks.push(_group)
        fn(_group)
        stacks.pop()
        return this
      },
      create: function (parentPath) {
        let path = _path
        if (path.substr(0, 1) !== '/') {
          path = compile_path(parentPath, path)
        }
        const result = { path: path }
        if (_name) result.name = _name
        if (_alias) result.alias = _alias
        if (_meta) result.meta = _meta
        if (_props) result.props = _props
        if (_components) result.components = _components
        if (_component) result.component = _component
        if (_redirect) result.redirect = _redirect

        if (_group) {
          result.children = _group.create(result.path)
        }
        return result
      }
    }
    stacks[stacks.length - 1].rules.push(rule)
    return rule
  }
  Route.create = function (baseAt) {
    return root.create(baseAt || '')
  }
  Route.group = function (prefix, fn) {
    return Route(prefix).group(fn)
  }
  const root = new RouteGroup()
  const stacks = [root]
  return Route
}

export default __constructor
