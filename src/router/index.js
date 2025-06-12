import { createRouter, createWebHistory,createWebHashHistory } from 'vue-router'
import { useAppStore, useUserStore } from '@/store'

import pinia from '@/store'
import { message } from 'ant-design-vue';

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
        {
          path: '/myLibrary/:title',
          name: 'myLibrary',
          component: () => import('../view/my/myLibrary.vue'),
          props: true
        },
        {
          path: '/fileAudit/:title',
          name: 'fileAudit',
          component: () => import('../view/fileAudit/fileAudit.vue'),
          props: true
        },
      ]
    },

  ]
})

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem("token");

  if (!token) {
    // 未登录，跳转到登录页
    if (to.path !== "/login") {
      message.error("登录失效，请先登录");
      return next("/login");
    } else {
      return next(); // 已经在登录页，放行
    }
  }

  // 已登录
  const appStore = useAppStore(pinia);
  const userStore = useUserStore(pinia);

  // 如果没有菜单，获取用户信息（同时也会包含权限/菜单）
  if (appStore.getMenu().length === 0) {
    await userStore.getProfile();
  }

  // 如果访问的路由没有匹配项，跳转首页
  if (to.matched.length === 0) {
    return next("/");
  }

  return next();
});

export default router
