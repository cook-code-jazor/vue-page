/** !
  * VASPA => Vue Async Single Page Application
  */

import Loader from './libs/bootloader'
import Installer from './libs/installer'
import axios from 'axios'

(function() {
  if (!window.Vue) {
    throw new Error('\'Vue\' not import')
  }
  Installer.install(window.Vue)
  window.axios = axios
  window.VASPA = Loader
})()
