import {
    defineStore
} from 'pinia'

import {
    useAppStore
} from './app'
import pinia from '@/store'

const menu = [{
    name: "首页",
    label: '首页',
    key: '/index', // 添加动态参数
    icon: 'DashboardOutlined',
    component: 'index',
},
    {
        name: '全部文库',
        label: '全部文库',
        key: '/allLibrary',
        icon: 'FolderFilled',
        isExpand: true,
        component: 'allLibrary',
        children: []
    },
    {
        name: '我的文库',
        label: '我的文库',
        key: '/myLibrary',
        icon: 'FolderFilled',
        // url: "/",
        isExpand: true,
        component: 'myLibrary',
        children: []
    },
    {
        name: '收藏',
        label: '收藏',
        key: '/collect',
        icon: 'TagOutlined',
        component: 'collect',

    },
    {
        name: '回收站',
        label: '回收站',
        key: '/recycle',
        icon: 'DeleteOutlined',
        component: 'recycle',
    },
    {
        name: '系统设置',
        label: '系统设置',
        key: '/setting',
        icon: 'SettingOutlined',
        component: 'setting',
    },
    {
        name: '文件审核',
        label: '文件审核',
        key: '/fileAudit',
        icon: 'ZhihuOutlined',
        component: 'fileAudit',
    },

]

export const useUserStore = defineStore('user', {
    state: () => {
        return {
            token: '',
        }
    },
    actions: {
        // 获取用户信息
        getProfile() {
            return new Promise((resolve, reject) => {
                // 模拟异步获取用户信息
                setTimeout(() => {
                    let userInfo = {
                        username: 'admin',
                        avatar: '',
                        roles: [],
                        menu: menu
                    }

                    // 设置app的菜单和路由
                    let appStore = useAppStore(pinia)
                    appStore.setMenu(userInfo.menu)
                    appStore.setRoute(userInfo.menu)

                    resolve(userInfo)
                }, 50)
            })
        }
    }
})
