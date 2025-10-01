import { VueQueryPlugin } from '@tanstack/vue-query'
import App from '@/App.vue'

import '@/assets/tailwind.css'

const app = createApp(App)

app.use(VueQueryPlugin)

app.mount('#app')
