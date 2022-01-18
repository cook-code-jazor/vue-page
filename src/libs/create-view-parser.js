
import { createComponent } from './cl'
function viewParser (options = { viewRoot: '/', viewSuffix: '.html' }) {
  const viewRoot = options.viewRoot
  const viewSuffix = options.viewSuffix
  const ctor_ = function (path) {
    return viewRoot + path + viewSuffix
  }
  ctor_.component = function (path, absolute) {
    return createComponent((absolute === true ? path : (viewRoot + path)) + viewSuffix)
  }
  ctor_.newInstance = function (options = { viewRoot: '/', viewSuffix: '.html' }) {
    return viewParser(options)
  }
  return ctor_
}
export default viewParser
