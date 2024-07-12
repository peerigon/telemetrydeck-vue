import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import TelementryDeckPlugin from './plugin'

const app = createApp(App)
app.use(TelementryDeckPlugin, {
  appID: '03158F6D-5EAE-4713-B148-69E003476E9A',
  testMode: true,
})

app.mount('#app')