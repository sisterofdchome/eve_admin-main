import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

import { useAppStore } from './module/app'
import { useUserStore } from './module/user'

export { useAppStore, useUserStore }
 
export default pinia
