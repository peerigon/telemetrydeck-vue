import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import TelementryDeckPlugin from './'

const app = createApp(App)
app.use(TelementryDeckPlugin, {
  appID: import.meta.env.VITE_TELEMENTRYDECK_APP_ID || 'test-app-id',
  testMode: true,
})

app.mount('#app')