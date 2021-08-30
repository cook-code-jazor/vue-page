/**
 * route resolver
 * */
import { createComponent } from './cl'

function path2component (url) {
  return createComponent(url)
}

function resolve (routes) {
  for (let i = 0; i < routes.length; i++) {
    const component = routes[i].component
    const components = routes[i].components
    component && typeof component === 'string' && (routes[i].component = path2component(component))

    if (components) {
      for (const name in components) {
        if (!components.hasOwnProperty(name)) continue
        components[name] && typeof components[name] === 'string' && (components[name] = path2component(components[name]))
      }
    }
    routes[i].children && resolve(routes[i].children)
  }
}

export default resolve
