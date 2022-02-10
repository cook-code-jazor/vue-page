
import Axios from './axios'

const createClient = (function () {
  function clearDialog (dialog) {}

  function createDialog (message) { return null }

  function showException (res) { }

  return function (options, dialogOptions) {
    dialogOptions = dialogOptions || {
      clearDialog,
      createDialog,
      showException
    }
    var axios_ = Axios.origin.create(options)
    axios_.interceptors.request.use(
      function (config) {
        if (config.ignoreInterceptors === true) return config
        var method = config.method.toUpperCase()
        if (
          method === 'POST' ||
          method === 'PUT' ||
          method === 'DELETE' ||
          typeof config.processMessage !== 'undefined'
        ) {
          config.$$dialog = dialogOptions.createDialog(config.processMessage)
        }
        return config
      },
      function (error) {
        error.config.$$dialog && dialogOptions.clearDialog(error.config.$$dialog)
        return Promise.error(error)
      }
    )

    axios_.interceptors.response.use(
      function (response) {
        response.config.$$dialog && dialogOptions.clearDialog(response.config.$$dialog)
        if (response.config.ignoreInterceptors === true) return response

        if (options.expects && options.expects.hasOwnProperty(response.status + '')) {
          return options.expects[response.status + ''].call(this, response, null)
        }
        return response
      },

      function (error) {
        const config = error.config
        config.$$dialog && dialogOptions.clearDialog(config.$$dialog)
        if (!error.response) return Promise.reject(error)
        if (config.ignoreInterceptors === true) return Promise.reject(error)

        var response = error.response

        if (response &&
          config.expects &&
          config.expects.hasOwnProperty(response.status + '')) {
          return config.expects[response.status + ''].call(this, response, error)
        }
        if (response && !config.noErrorTips) dialogOptions.showException(response.data)
        return Promise.reject(error)
      }
    )
    return axios_
  }
})()

export default createClient
