import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import TelemetryDeckPlugin from '../index.ts'

const app = createApp(App)
app.use(TelemetryDeckPlugin, {
  appID: import.meta.env.VITE_TELEMETRYDECK_APP_ID || 'test-app-id',
  testMode: true,
})

app.mount('#app')