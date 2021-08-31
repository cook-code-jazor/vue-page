import axios from 'axios'
import { hasOwnProperty } from './utils'

export default (function () {
  const require_cache = {}

  function parseResponse (script) {
    const module = { exports: {}};
    (new Function('module', 'exports', script))(module, module.exports)
    return module.exports
  }

  const axios_ = axios.create({
    headers: { 'X-Requested-With': 'XMLHttpRequest' }
  })
  axios_.interceptors.request.use(function (config) {
    if (config.cache !== true) {
      config.headers['Expires'] = 0
      config.headers['Cache-Control'] = 'no-cache'
      config.headers['Pragma'] = 'no-cache'
    }
    return config
  }, function (error) {
    return Promise.reject(error)
  })
  axios_.require = function (url, options) {
    options = options || {}
    const cache_tag = url
    const singlon_cache_tag = cache_tag + '--singlon'
    if (hasOwnProperty(require_cache, cache_tag)) {
      if (hasOwnProperty(options, 'singlon')) {
        return Promise.resolve(require_cache[singlon_cache_tag])
      }
      return Promise.resolve(parseResponse(require_cache[cache_tag]))
    }
    return axios_.get(url).then(function (response) {
      require_cache[cache_tag] = response.data
      require_cache[singlon_cache_tag] = parseResponse(response.data)
      return require_cache[singlon_cache_tag]
    })
  }
  axios_.origin = axios
  return axios_
})()
