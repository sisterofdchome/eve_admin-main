<template>
  <a-layout>
    <!-- 左侧部分开始 -->
    <a-layout-sider :style="{ overflow: 'auto', height: '100vh', background: theme == 'light' ? '#fff' : '#001628' }" v-model:collapsed="sideCollapsed">
      <!-- 左侧logo开始 -->
      <div class="logo">
        <img src="/vite.svg" class="logo_img" alt="Vite logo" />
        <span class="logo_text" :style="{ color: theme == 'light' ? '#011528' : '#fff' }" v-show="!sideCollapsed">知识库</span>
      </div>
      <!-- 左侧logo结束 -->

      <!-- 左侧菜单开始 -->
      <!-- <a-menu v-model:selectedKeys="selectedKeys" :theme="theme" :items="menu" mode="inline" @click="menuClicked" /> -->

      <div style="padding-left: 12px">
        <template v-for="(item, index) in menuList">
          <div :class="menuIndex == item.key ? 'silder-item silder-item-active' : 'silder-item'" @click="toPath(item, index)">
            <div class="icon-list">
              <CaretRightOutlined
                :class="item.isExpand ? 'my-transition' : ''"
                style="font-size: 12px"
                @click.stop="item.isExpand = !item.isExpand"
                v-if="!sideCollapsed"
                v-show="item.children && item.children.length > 0"
              />
            </div>
            <div class="title">
              <!-- <template v-if="item.icon && !item.icon.indexOf('svg-') > -1">
								<component :key="index" :is="item.icon" class="menu-icon"/>
							</template> -->
              <svg-icon :name="item.icon" class="menu-icon" :color="menuIndex == item.key ? '#1e6fff' : ''"></svg-icon>
              <span v-if="!sideCollapsed">{{ item.title }}</span>
            </div>
          </div>
          <div :class="!item.isExpand ? 'list-box' : 'list-box list-box-open'" v-if="!sideCollapsed && item.children && item.children.length > 0">
            <div class="list-items">
              <div :class="menuIndex == child.key ? 'list-item silder-item-active' : 'list-item'" v-for="(child, childIndex) in item.children" @click="toPath(child, childIndex, index, true)">
                <svg-icon :name="item.icon" class="menu-icon" :color="menuIndex == child.key ? '#1e6fff' : ''"></svg-icon><span>{{ child.name }}</span>
              </div>
            </div>
          </div>
        </template>
      </div>
      <!-- 左侧菜单结束 -->
    </a-layout-sider>
    <!-- 左侧部分结束 -->

    <!-- 右侧部分开始 -->
    <a-layout>
      <!-- 右侧header开始 -->
      <a-layout-header style="background: #fff; padding: 0; height: 50px; display: flex; align-items: center; position: relative">
        <MenuUnfoldOutlined v-if="sideCollapsed" class="trigger" @click="appAction.changeCollapsed" />
        <MenuFoldOutlined v-else class="trigger" @click="appAction.changeCollapsed" />
        <Header @updateSuccess="handleUpdateSuccess" :value="selectedValue"></Header>
        <a-switch size="small" :checked="theme === 'dark'" checked-children="Dark" un-checked-children="Light" @change="appAction.changeTheme" class="themeSwitchMenu" />
      </a-layout-header>
      <!-- 右侧header结束 -->
      <!-- 右侧页面主体开始 -->
      <a-layout-content :style="{ margin: '12px 10px', background: '#fff', minHeight: '280px', borderRadius: '4px' }">
        <router-view></router-view>
      </a-layout-content>
      <!-- 右侧页面主体结束 -->
    </a-layout>
    <!-- 右侧部分结束 -->
  </a-layout>
</template>
<script setup lang="js">
  import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    AppstoreOutlined,
    SettingOutlined,
    DashboardOutlined,
    CaretRightOutlined,
    FolderFilled,
    DeleteOutlined,
    TagOutlined,
    PlusOutlined,
    DownloadOutlined,
  } from "@ant-design/icons-vue";
  import Header from "./Header.vue";
  import { ref, h, onMounted, reactive, watch } from "vue";
  import { useRouter } from "vue-router";
  import { storeToRefs } from "pinia";
  import { postlibraryapi } from "../api/index.js";
  import qs from "qs";
  // 引入appStore
  import { useAppStore } from "../store/module/app";

  const selectedValue = ref("");
  const appStore = useAppStore();
  // 引入appStore中的属性
  const { sideCollapsed, theme, menu, selectedKeys, openKeys, selectedChildren, shouldRefreshLeftLibrary, breadValue, breadLength } = storeToRefs(appStore);
  const router = useRouter();
  // 定义App操作类，
  const appAction = {
    changeTheme: () => {
      // 调用appStore中定义的changeTheme方法
      appStore.changeTheme();
    },
    changeCollapsed: () => {
      // 调用appStore中定义的changeCollapsed方法
      appStore.changeCollapsed();
    },
  };
  const toPath = (item, index, index2) => {
    console.log(item);
    console.log(index);
    console.log(index2);
    // 初始化面包屑
    if (breadValue.value[1].url != item.url) {
      appStore.initBread();
    }
    if (index2 !== undefined) {
      changeBread(item, index, index2);
    }
    menuIndex.value = item.key;
    // 传入header的id
    selectedValue.value = item.key;
    // 菜单选中
    selectedKeys.value = item.key;
    // 更新点击时的文件夹id
    selectedChildren.value = item.key;

    console.log("item.url", item.url);

    // 生成带参数的路由路径
    // const targetPath = item.key.replace(/:id/, item.id_);
    router.push(item.url);
    if (item.url) {
      // router.push({
      //   path: item.url, // 直接使用配置的 url
      //   query: {
      //     id: item.key || "0", // 防止 key 为 undefined
      //     title: item.title,
      //   },
      // });
    }
  };
  // 处理面包屑
  const changeBread = (item, index, index2) => {
    const first = index2 == 1 ? "全部文库" : "我的文库";
    // appStore.addBread(first);
    // appStore.addBread(item.name);
    breadValue.value[0] = { id: 0, name: first, url: `/allLibrary/${first}` };
    breadValue.value[1] = { id: item.id_, name: item.name, url: item.url };

    console.log(breadValue.value);
  };
  const menuIndex = ref(-11);
  const menuList = ref([
    {
      title: "首页",
      key: "-11",
      icon: "home",
      url: "/index",
    },
    {
      title: "全部文库",
      key: "-12",
      icon: "svg-wxz",
      url: "/allLibrary/全部文库",
      isExpand: false,
      children: [],
    },
    {
      title: "我的文库",
      key: "-13",
      icon: "svg-wxz",
      url: "/",
      isExpand: false,
      children: [
        // {
        //   title: "文库-4",
        //   key: "8",
        //   icon: "svg-wxz",
        //   url: "/library",
        // },
        // {
        //   title: "文库-5",
        //   key: "6",
        //   icon: "svg-wxz",
        //   url: "/library",
        // },
        // {
        //   title: "文库-6",
        //   key: "7",
        //   icon: "svg-wxz",
        //   url: "/library",
        // },
      ],
    },
    {
      title: "收藏",
      key: "-14",
      icon: "collect",
      url: "/collect",
    },
    {
      title: "回收站",
      key: "-15",
      icon: "recycle",
      url: "/recycle",
    },
  ]);

  onMounted(() => {
    leftLibraryList();

    setTimeout(() => {
      router.push({
        path: "/index", // 直接使用配置的 url
      });
    }, 500);
  });

  // 获取文库列表
  const leftLibraryList = async () => {
    const formData = {
      type: "list",
      pid: "0",
    };
    const response = await postlibraryapi(qs.stringify(formData)); // 调用接口
    console.log("接口请求成功:", response);
    if (response.data.code == 1) {
      menuList.value[1].children = response.data.obj.data;
      console.log(menuList.value);
      menuList.value[1].children.forEach((item, index) => {
        item.key = item.id_;
        item.icon = "svg-wxz";
        item.url = "/library/" + item.id_;
      });
    }
  };

  // 处理子组件header传来的更新
  const handleUpdateSuccess = (key, title) => {
    //
    // menuIndex.value = selectedKeys.value;
    menuIndex.value = key;
    if (title == "文库") router.push("/library/" + key);
    leftLibraryList();
  };
  watch(
    () => appStore.refreshKey,
    () => {
      leftLibraryList(); // 重新获取文库列表
    }
  );
  watch(
    () => appStore.selectedKeys,
    () => {
      menuIndex.value = selectedKeys.value;
    }
  );
  // 添加文库后，刷新文库列表
  watch(shouldRefreshLeftLibrary, () => {
    // 获取当前点击的路径
    leftLibraryList(); // 精准刷新当前目录
  });
  // 面包屑标识，len=2 还退回时，跳转
  watch(breadLength, () => {
    // 获取当前点击的路径
    // leftLibraryList(); // 精准刷新当前目录
  });
</script>
<style scoped>
  .silder-item .title .menu-icon {
    width: 15px;
    height: 15px;
    margin-right: 8px;
  }

  .silder-item-active .menu-icon {
    color: #1e6fff;
  }

  .trigger {
    display: block;
    font-size: 18px;
    width: 40px;
    line-height: 50px;
    padding: 2px 16px 0 16px;
    cursor: pointer;
    transition: color 0.3s;
    float: left;
  }

  .trigger:hover {
    color: #1890ff;
  }

  .logo {
    height: 32px;
    /* background: rgba(255, 255, 255, 0.3); */
    margin: 9px;
    overflow: hidden;
  }

  .logo_img {
    margin-left: 12px;
    display: block;
    float: left;
    line-height: 32px;
    text-align: center;
    color: #fff;
    font-size: 20px;
    margin-left: 8px;
    font-weight: 900;
  }

  .logo_text {
    display: block;
    float: left;
    line-height: 32px;
    text-align: center;
    font-size: 20px;
    margin-left: 8px;
    font-weight: 900;
  }

  .site-layout .site-layout-background {
    background: #fff;
  }

  .themeSwitchMenu {
    display: block;
    position: absolute;
    right: 0;
    margin-right: 20px;
  }

  .silder-item {
    white-space: nowrap;
    height: 36px;
    display: flex;
    align-items: center;
    padding: 0 13px;
    box-sizing: border-box;
    cursor: pointer;
    margin-right: 12px;
  }

  .silder-item + .silder-item {
    margin-top: 6px;
  }

  .silder-item-active {
    background: #e6f4ff !important;
    border-radius: 4px;
  }

  .silder-item .icon-list {
    width: 14px;
    height: 14px;
    margin-right: 9px;
    display: flex;
    align-items: center;
  }

  .silder-item .title {
    display: flex;
    align-items: center;
  }

  .silder-item .title {
    color: #363b4c;
    font-size: 14px;
    font-family: SourceHanSansCN-Regular;
  }

  .list-box {
    display: grid;
    flex-direction: column;
    grid-template-rows: 0fr;
    overflow: hidden;
    transition: all 0.4s;
    margin-right: 12px;
  }

  .list-items .list-item .menu-icon {
    min-width: 15px;
    width: 15px;
    height: 15px;
    margin-right: 8px;
  }

  .list-box-open {
    grid-template-rows: 1fr;
  }

  .list-box .list-items {
    overflow: hidden;
  }

  .list-box .list-items .list-item {
    display: flex;
    align-items: center;
    height: 36px;
    font-size: 14px;
    color: #363b4c;
    padding-left: 42px;
    cursor: pointer;
  }

  .list-box .list-items .list-item span {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .silder-item-active .title span,
  .list-items .silder-item-active span {
    color: #1e6fff !important;
  }

  svg {
    transition: all 0.3s;
  }

  .my-transition {
    transform: rotate(90deg) translateX(0.5px);
  }

  .silder-item:hover,
  .list-item:hover {
    background-color: #e6f4ff;
  }
</style>
