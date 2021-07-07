/** !
  * VASPA => Vue Async Single Page Application
  */

import Loader from './libs/bootloader'
import Installer from './libs/installer'
import axios from 'axios'

(function() {
  Loader.use(Installer)
  window.axios = axios
  window.VASPA = Loader
})()
