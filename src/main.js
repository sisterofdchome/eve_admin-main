import { createApp } from 'vue'
import router from './router'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import App from './App.vue'
import { message } from 'ant-design-vue';
import pinia from './store'
import 'virtual:svg-icons-register'
import GlobalComponents from '@/plugin'

createApp(App).use(router).use(pinia).use(Antd).use(GlobalComponents).mount('#app')
