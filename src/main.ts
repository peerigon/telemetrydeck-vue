import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import TelementryDeckPlugin from './plugin'

const app = createApp(App)
app.use(TelementryDeckPlugin, {
  appID: import.meta.env.VITE_TELEMENTRYDECK_APP_ID,
  testMode: true,
})

app.mount('#app')