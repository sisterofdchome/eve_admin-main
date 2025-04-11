const routerComponents = {
  Dashboard: () => import('../view/dashboard.vue'),
  UserList: () => import('../view/user_list.vue'),
  library: () => import('../view/library/index.vue'),
  recycle: () => import('../view/recycle/recycle.vue'),
  collect: () => import('../view/collect/collect.vue'),
  allLibrary: () => import('../view/all/allLibrary.vue'),
}

export default routerComponents
