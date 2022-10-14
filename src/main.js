import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'

import { createPinia } from 'pinia'

import { Buffer } from "buffer";

window.Buffer = Buffer

loadFonts()

createApp(App)
  .use(vuetify)
  .use(createPinia())
  .mount('#app')
