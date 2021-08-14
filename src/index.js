/** !
  * VASPA => Vue Async Single Page Application
  */

import Loader from './bootloader'
import Installer from './libs/installer'
import qs from './libs/qs'
import axios from 'axios'
import './libs/promise.min'
import { createApp, createComponent, registerComponent } from './libs/cl'

(function() {
  Loader.use(Installer)
  Loader.qs = qs
  Loader.axios = axios
  Loader.createApp = createApp
  Loader.createComponent = createComponent
  Loader.registerComponent = registerComponent
  window.vaspa = Loader
})()
