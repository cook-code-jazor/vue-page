/** !
  * VASPA => Vue Async Single Page Application
  */

import Loader from './bootloader'
import Installer from './libs/installer'
import qs from './libs/qs'
import axios from 'axios'
import './libs/promise.min'

(function() {
  Loader.use(Installer)
  window.qs = qs
  window.axios = axios
  window.vaspa = Loader
})()
