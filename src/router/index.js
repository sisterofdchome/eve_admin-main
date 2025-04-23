import { createRouter, createWebHistory,createWebHashHistory } from 'vue-router'
import { useAppStore, useUserStore } from '@/store'

import pinia from '@/store'

const router = createRouter({
  // history: createWebHistory(''),
  history:createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../view/login.vue')
    },
    {
      path: '',
      name: 'basic',
      component: () => import('@/layout/Layout.vue'),
      children: [
        {
          path: '/library/:id',
          name: 'Library',
          component: () => import('../view/library/index.vue'),
          props: true
        },
        {
          path: '/index/:id',
          name: 'Index',
          component: () => import('../view/index/index.vue'),
          props: true
        },
        {
          path: '/allLibrary/:title',
          name: 'AllLibrary',
          component: () => import('../view/all/allLibrary.vue'),
          props: true
        },
      ]
    },

  ]
})

router.beforeEach(async (to, from) => {
  // 判断是否有菜单，如果没有则获取菜单，然后设置router和菜单
  // todo 这里后期还会调整，需要通过用户登录状态来判断
  let appStore = useAppStore(pinia)
  if (appStore.getMenu().length == 0) {
    // 调用用户的简介接口（简介接口会获取用户的基本信息以及菜单权限信息）
    let userStore = useUserStore(pinia)
    userStore.getProfile()
  }

  console.log("to",to)
  // 没有匹配到路由时则跳转到首页
  if (to.matched.length == 0) {
      router.push('/')
    }
})

export default router
