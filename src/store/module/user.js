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
		isExpand: false,
		component: 'allLibrary',
		children: [{
				name: '文库-1',
				label: '文库-1',
				key: '/library',
				icon: 'CaretRightOutlined',
				url: "/library",
				component: 'library',
			},
			{
				name: '文库-2',
				label: '文库-2',
				key: '4',
				icon: 'CaretRightOutlined',
				url: "/library"
			},
			{
				name: '文库-3',
				label: '文库-3',
				key: '5',
				icon: 'CaretRightOutlined',
				url: "/library"
			}
		]
	}, 
	{
		name: '我的文库',
		label: '我的文库',
		key: '/myLibrary',
		icon: 'FolderFilled',
		url: "/",
		isExpand: false,
		component: 'myLibrary',
		children: [{
				name: '文库-4',
				label: '文库-4',
				key: 'library',
				icon: 'CaretRightOutlined',
			},
			{
				name: '文库-5',
				label: '文库-5',
				key: '6',
				icon: 'CaretRightOutlined',
			},
			{
				name: '文库-6',
				label: '文库-6',
				key: '7',
				icon: 'CaretRightOutlined',
			}
		]
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
	}
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
