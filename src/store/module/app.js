import { defineStore } from "pinia";
import { h } from "vue";
import * as icons from "@ant-design/icons-vue";
import routerComponents from "@/router/view_component";
import router from "@/router/index.js";
import { postcollectapi } from "../../api/index.js";
import { message } from "ant-design-vue";
import qs from "qs";

export const useAppStore = defineStore("app", {
  state: () => {
    return {
      sideCollapsed: false, // 控制左侧菜单栏是否折叠
      theme: "light", // 主题
      menu: [], // 菜单列表
      selectedKeys: "", // 菜单中选中的项
      selectedChildren: "", // 实时选中的子文件夹
      openKeys: [], // 菜单中展开的项
      refreshKey: 0, // 新增，用于触发全局刷新
      shouldRefreshLeftTree: false, // 刷新左侧文件夹树
      shouldRefreshLeftLibrary: false, // 刷新左侧文库树
      clickLibraryStatus: false, //刷新文库设置信息
      //面包屑数组
      breadValue: [
        { id: 0, name: 0, url: 0 },
        { id: 1, name: 1, url: 1 },
      ],
      // 退回时候，最后一个id
      breadLastId: "",
      breadChanges: 0,
      // 文件详情页面
      // 控制是否点击了文档
      fileVisible: false,
      // 是否回到了文库
      backLibrary: false,
      //
      currentFavoriteId: "", // 当前操作的收藏项ID
      isFavorite: 0, // 收藏状态（0未收藏，1已收藏）
      selectedFileId: "", // 当前选中的文件ID
    };
  },
  actions: {
    // 更新收藏状态
    updateFavoriteStatus(id, status) {
      this.currentFavoriteId = id;
      this.isFavorite = status;
    },
    // 改变文档详情页面的显示状态
    fileVisibleTrue() {
      this.fileVisible = true;
    },
    // 初始化面包屑数组
    initBread() {
      this.breadValue = this.breadValue.slice(0, 2);
    },
    // 面包屑增加
    addBread(id, name, url) {
      this.fileVisible = false;
      this.breadValue.push({ id: id, name: name, url: url });
    },
    // 面包屑退回
    backBread() {
      this.breadValue.pop(); // 删除最后一项
      this.breadLastId = this.breadValue[this.breadValue.length - 1].id;
      this.selectedChildren = this.breadLastId;
      // return id;
      this.breadChanges++;
    },
    triggerLeftTreeRefresh() {
      this.shouldRefreshLeftTree = !this.shouldRefreshLeftTree;
    },
    // 刷新左侧文库树
    triggerLeftLibraryRefresh() {
      this.shouldRefreshLeftLibrary = !this.shouldRefreshLeftLibrary;
    },
    // 获取文库详情
    triggerStatusRefresh() {
      this.clickLibraryStatus = !this.clickLibraryStatus;
    },
    changeTheme() {
      this.theme = this.theme == "light" ? "dark" : "light";
    },
    changeCollapsed() {
      this.sideCollapsed = !this.sideCollapsed;
    },
    triggerRefresh() {
      this.refreshKey++;
    },
    selectMenu(key) {
      this.selectedKeys = key;
    },
    selectChildren(key) {
      this.selectedChildren = key;
    },
    async toggleFavorite(item) {
      try {
        const actionType = item.is_favorite ? "delete" : "add";
        const formData = {
          type: actionType,
          [actionType === "add" ? "favorite_id" : "id_"]: actionType === "add" ? item.id_ : item.is_favorite
        };
    
        const response = await postcollectapi(qs.stringify(formData));
        
        if (response.data.code !== 1) {
          throw new Error(response.data.msg);
        }
    
        // 更新全局状态
        this.currentFavoriteId = item.id_;
        this.isFavorite = actionType === "add" ? "1" : 0;
        
        message.success(actionType === "add" ? "收藏成功" : "取消收藏成功");
        this.refreshKey++
        return true;
      } catch (error) {
        message.error(`操作失败: ${error.message}`);
        return false;
      }
    },
    setMenu(menu) {
      // 首先深拷贝一下menu参数，因为这里需要对参数值进行一些修改
      let menuList = JSON.parse(JSON.stringify(menu));

      // 定义一个获取Icon的方法，将后端传过来的Icon图标名称解析为图标组件
      const genMenuIcon = (list) => {
        for (let item of list) {
          if (item.icon && typeof item.icon === "string") {
            item.icon = h(eval("icons." + item.icon));
          }

          if (item.hasOwnProperty("children")) {
            genMenuIcon(item.children);
          }
        }
      };

      // 格式化菜单
      genMenuIcon(menuList);

      // 设置menu状态值
      this.menu = menuList;
    },
    getMenu() {
      return this.menu;
    },
    setRoute(menu) {
      // 拷贝menu对象
      let menuList = JSON.parse(JSON.stringify(menu));

      // childrenNav用来存放路由数据，由于动态加载的路由都处于basic路由之下
      const childrenNav = [];

      // 定义一个递归方法用于处理菜单数据
      const makeRouter = (list) => {
        for (let item of list) {
          if (item.component) {
            console.log(item.key);
            console.log(item.component);
            childrenNav.push({
              path: item.key,
              name: item.component,
              component: routerComponents[item.component],
              meta: {
                keepAlive: true,
              },
            });
          }

          if (item.hasOwnProperty("children")) {
            makeRouter(item.children);
          }
        }
      };

      makeRouter(menuList);

      // 将childrenNav注册到basic路由下
      console.log("childrenNav", childrenNav);
      childrenNav.forEach((r) => {
        router.addRoute("basic", r);
      });

      console.log("childrenNav", childrenNav);
    },
  },
  persist: {
    enabled: true,
    key: "app",
    paths: ["theme", "sideCollapsed"],
  },
});
