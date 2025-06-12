const routerComponents = {
  Dashboard: () => import('../view/dashboard.vue'),
  UserList: () => import('../view/user_list.vue'),
  library: () => import('../view/library/index.vue'),
  collect: () => import('../view/collect/collect.vue'),
  // 所有文库
  allLibrary: () => import('../view/all/allLibrary.vue'),
  // 首页
  index: () => import('../view/index/index.vue'),
  recycle: () => import('../view/recycle/recycle.vue'),
  fileAudit: () => import('../view/fileAudit/fileAudit.vue'),
}

export default routerComponents
