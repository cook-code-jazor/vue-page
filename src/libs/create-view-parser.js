export default function (options = { viewRoot: '/', viewSuffix: '.html' }) {
  const viewRoot = options.viewRoot
  const viewSuffix = options.viewSuffix
  return function (path) {
    return viewRoot + path + viewSuffix
  }
}
