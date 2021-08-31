
import { createComponent } from './cl'

export default function (options = { viewRoot: '/', viewSuffix: '.html' }) {
  const viewRoot = options.viewRoot
  const viewSuffix = options.viewSuffix
  const ctor_ = function (path) {
    return viewRoot + path + viewSuffix
  }
  ctor_.component = function (path) {
    return createComponent(viewRoot + path + viewSuffix)
  }
  return ctor_
}
