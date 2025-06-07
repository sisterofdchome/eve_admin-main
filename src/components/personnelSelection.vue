<template>
  <a-modal v-model:visible="personVisible" title="人员选择" centered @ok="handleOk" width="730px" :confirm-loading="loading" :maskClosable="false">
    <a-spin :spinning="loading">
      <div class="user-info-list">
        <div class="user-info-left">
          <div class="user-info-title">
            <div :class="index == userTabActive ? 'user-tab-item user-tab-active' : 'user-tab-item'" v-for="(item, index) in userTabList" @click="changeTab(index)">
              {{ item.name }}
            </div>
          </div>
          <div class="user-info-body">
            <div class="search-box" v-if="userTabActive == 0">
              <a-input-search v-model:value="condition" placeholder="请输入搜索内容" enter-button @search="handleSearch" allowClear :loading="searchLoading" />
            </div>
            <div class="content" v-if="userTabActive == 0">
              <template v-if="userList.length > 0">
                <div class="check-box-item" v-for="item in userList" @click="selHandle(item, 'user')">
                  <template v-if="!isChecked(item.id, 'user')">
                    <BorderOutlined class="icon" />
                  </template>
                  <template v-else>
                    <CheckSquareFilled style="color: #1677ff; font-size: 18px" />
                  </template>
                  <img src="../assets/libary/userHead.png" />
                  <span class="name">{{ item.fullname }}</span>
                </div>
              </template>
              <a-empty v-else description="暂无人员数据" />
            </div>
            <div class="content no-user-content" v-if="userTabActive == 1">
              <!-- <template v-if="deptList.length > 0">
                <a-button type="primary" style="margin-left: 31px">刷新</a-button>
                <div class="check-box-item" v-for="item in deptList" @click="selHandle(item, 'dept')">
                  <template v-if="!isChecked(item.id, 'dept')">
                    <BorderOutlined class="icon" />
                  </template>
                  <template v-else>
                    <CheckSquareFilled style="color: #1677ff; font-size: 18px" />
                  </template>
                  <span class="name">{{ item.name }}</span>
                </div>
              </template> -->
              <div v-if="deptList.length > 0">
                <a-button type="primary" style="margin: 10px 20px" @click="getTreeDataByDemid('refresh')">刷新</a-button>
                <a-tree v-model:value="treeValue" checkable defaultExpandAll :selectable="false" v-model:checkedKeys="checked_Keys" multiple :tree-data="deptList" @check="handleCheck">
                  <template #title="{ name, value, parentId }">
                    <span v-if="parentId === '0'" style="color: #1890ff" disabled>{{ name }}</span>
                    <template v-else>{{ name }}</template>
                  </template>
                </a-tree>
              </div>
              <a-empty v-else description="暂无部门数据" />
            </div>
            <div class="content no-user-content" v-if="userTabActive == 2">
              <template v-if="roleList.length > 0">
                <div class="check-box-item" v-for="item in roleList" @click="selHandle(item, 'role')">
                  <template v-if="!isChecked(item.id, 'role')">
                    <BorderOutlined class="icon" />
                  </template>
                  <template v-else>
                    <CheckSquareFilled style="color: #1677ff; font-size: 18px" />
                  </template>
                  <span class="name">{{ item.name }}</span>
                </div>
              </template>
              <a-empty v-else description="暂无角色数据" />
            </div>
            <div class="page" v-if="total > 0 && userTabActive == 0">
              <a-pagination size="small" :total="total" :show-total="(total) => `共 ${total} 条数据`" show-quick-jumper @change="handlePageChange" />
            </div>
          </div>
        </div>
        <div class="user-info-right">
          <div class="user-right-title">
            <div class="num">已选({{ selectUserList.length }})</div>
            <div class="clear" @click="clearSelection">清空</div>
          </div>
          <div class="user-right-content">
            <template v-if="selectUserList.length > 0">
              <div class="cehck-item" v-for="item in selectUserList">
                <div class="check-item-info">
                  <img src="../assets/libary/userHead.png" v-if="item.type == 'user'" />
                  <span v-else-if="item.type == 'dept'">（部门）</span>
                  <span :title="item.name">{{ item.name }}</span>
                </div>
                <CloseCircleFilled class="close-icon" @click.stop="selHandle(item, item.type)" />
              </div>
            </template>
            <a-empty v-else description="暂无选择" />
          </div>
        </div>
      </div>
    </a-spin>
  </a-modal>
</template>

<script setup>
  import { ref, watch, onMounted } from "vue";
  import { BorderOutlined, CheckSquareFilled, CloseCircleFilled } from "@ant-design/icons-vue";
  import { postUserListJson, postTreeDataByDemid, getOrgTreeApi } from "../api/index.js";
  import qs from "qs";
  import { message } from "ant-design-vue";
  import { TreeSelect } from "ant-design-vue";
  const SHOW_PARENT = TreeSelect.SHOW_PARENT;

  // 加载状态
  const loading = ref(false);
  const searchLoading = ref(false);

  // 其他原有代码保持不变...
  const userTabActive = ref(0);
  const userTabList = ref([
    { name: "人员", id: 0 },
    { name: "部门", id: 2 },
  ]);

  const userList = ref([]);
  const roleList = ref([]);
  const deptList = ref([]);
  const selectUserList = ref([]);
  const condition = ref("");
  const personVisible = ref(false);
  const currentIndex = ref("");
  const total = ref(0);
  const treeValue = ref([]);

  const pages = ref({
    page: 1,
    limit: 10,
  });

  // 修改后的获取数据方法
  const getUserListJson = async () => {
    loading.value = true;
    const data = {
      page: pages.value.page,
      rows: pages.value.limit,
      "Q^fullname_^SL": condition.value,
    };
    let res = await postUserListJson(qs.stringify(data));
    userList.value = res.data.rows.map((item) => ({
      ...item,
      name: item.fullname,
    }));
    total.value = res.data.total || 0;
    loading.value = false;
  };

  const getTreeDataByDemid = async (type) => {
    loading.value = true;

    const isRefresh = type === 'refresh';
    const cacheKey = 'orgTreeCache';

    if (!isRefresh) {
      const cache = localStorage.getItem(cacheKey);
      if (cache) {
        try {
          const cachedData = JSON.parse(cache);
          console.log("使用本地缓存:", cachedData);
          deptList.value = cachedData.map((item) => ({
            ...item,
            disabled: true,
            lable: item.name,
          }));
          loading.value = false;
          return;
        } catch (e) {
          console.warn("缓存解析失败，重新请求接口", e);
        }
      }
    }

    // 请求接口（首次或刷新）
    const response = await getOrgTreeApi({ type });
    const orgData = response.data.obj.sys_org_redis || [];

    deptList.value = orgData.map((item) => ({
      ...item,
      disabled: true,
      lable: item.name,
    }));

    // 缓存数据（覆盖旧的）
    localStorage.setItem(cacheKey, JSON.stringify(orgData));

    console.log("接口请求成功:", orgData);
    loading.value = false;
  };


  // 新增方法
  const changeTab = async (index) => {
    userTabActive.value = index;
    // 可以根据需要在这里加载对应tab的数据
    // if (index === 0) {
    //   await getUserListJson();
    // }
    // if (index === 1) {
    //   await getTreeDataByDemid("get");
    //   console.log(checked_Keys.value);
    // }
  };

  const handleSearch = () => {
    searchLoading.value = true;
    getUserListJson().finally(() => {
      searchLoading.value = false;
    });
  };

  const handlePageChange = (page, pageSize) => {
    // 处理分页变化
    console.log("Page changed:", page, pageSize);
    // 这里可以添加获取分页数据的逻辑
    pages.value.page = page;
    pages.value.limit = pageSize;
    getUserListJson();
  };

  const clearSelection = () => {
    selectUserList.value = [];
  };

  // 其他原有方法保持不变...
  const isChecked = (id, type) => {
    return selectUserList.value.findIndex((item) => item.id === id && item.type === type) !== -1;
  };

  const selHandle = (user, type) => {
    let index = selectUserList.value.findIndex((item) => item.id === user.id && item.type === type);
    if (index !== -1) {
      selectUserList.value.splice(index, 1);
    } else {
      user.type = type;
      selectUserList.value.push(user);
    }
    console.log(selectUserList.value);
  };
  const handleCheck = (checkedKeys, e) => {
    if (e.node.dataRef.children != undefined) {
      return;
    }

    console.log("handleCheck", checkedKeys, e);
    const item = e.node.dataRef;
    item.id = item.value;
    selHandle(item, "dept");
    console.log(checked_Keys.value);
  };

  const closePersonVisible = () => {
    personVisible.value = false;
  };

  const showPersonVisible = async (index, userList) => {
    personVisible.value = true;
    currentIndex.value = index;
    selectUserList.value = userList || [];
    console.log("userList: ", userList);

    // 打开时加载数据
    await getUserListJson();
    await getTreeDataByDemid("get"); // 等待数据加载完成
    const value = [];
    // 将userList每一项的value放在一个数组里，type为dept
    // userList.forEach((item) => {
    //   if (item.type === "dept") {
    //     value.push(item.value);
    //   }
    // });
    // console.log("value: ", value);

    // checked_Keys.value = ["0-0-0"];
    // checked_Keys.value = value;
  };

  const handleOk = () => {
    loading.value = true;
    setTimeout(() => {
      personVisible.value = false;
      emit("submitUsers", selectUserList.value, currentIndex.value);
      loading.value = false;
    }, 300);
  };
  const expandedKeys = ref([]);
  const checked_Keys = ref([]);
  watch(expandedKeys, () => {
    console.log("expandedKeys", expandedKeys);
  });
  watch(checked_Keys, () => {
    console.log("checked_Keys", checked_Keys);
  });
  watch(treeValue, () => {
    console.log(treeValue.value);
  });

  const emit = defineEmits(["submitUsers"]);

  defineExpose({
    showPersonVisible,
  });
</script>

<style>
  .user-info-list {
    display: flex;
  }

  .user-info-list .user-info-left {
    width: 460px;
    border-right: 1px solid #eeeff0;
  }

  .user-info-list .user-info-right {
    width: calc(100% - 460px);
  }

  .user-info-list .user-info-left .user-info-title {
    display: flex;
    align-items: center;
    height: 40px;
    padding: 0 15px;
    border-bottom: 1px solid #eeeff0;
  }

  .user-info-list .user-info-left .user-info-title .user-tab-item {
    height: 40px;
    font-size: 14px;
    color: #6f7588;
    cursor: pointer;
    position: relative;
    display: flex;
    align-items: center;
  }

  .user-info-list .user-info-left .user-info-title .user-tab-active {
    color: #1e6fff;
    font-size: 14px;
    font-weight: 700;
  }

  .user-info-list .user-info-left .user-info-body {
    height: 370px;
  }

  .user-info-list .user-info-left .user-info-body .search-box {
    display: flex;
    align-items: center;
    margin: 16px 32px 16px 24px;
    background: #f5f6f7;
    border-radius: 4px;
  }

  .user-info-list .user-info-left .user-info-body .content {
    height: 283px;
    overflow: overlay;
  }

  .user-info-list .user-info-left .user-info-body .no-user-content {
    height: 323px;
    overflow: overlay;
  }

  .user-info-list .user-info-left .user-info-title .user-tab-item + .user-tab-item {
    margin-left: 32px;
  }

  .user-info-list .user-info-left .user-info-title .user-tab-active:after {
    position: absolute;
    left: 0;
    content: "";
    bottom: 0;
    width: 100%;
    height: 3px;
    background: #1e6fff;
    border-radius: 2px 0;
  }

  .search-box .h-line {
    height: 14px;
    background-color: #d7d8db;
    width: 1px;
    margin-left: 0;
    margin-right: 0;
  }

  .check-box-item {
    margin: 0 8px;
    height: 36px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 0 16px 0 24px;
  }

  .check-box-item img {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    margin-left: 12px;
  }

  .check-box-item .icon {
    width: 18px;
    height: 18px;
    min-width: 18px;
    cursor: pointer;
    color: #a0a3ad;
    font-size: 18px;
  }

  .check-box-item .name {
    margin-left: 12px;
  }

  .user-info-list .user-info-left .user-info-body .page {
    display: flex;
    align-items: center;
    justify-content: end;
    font-size: 14px;
    color: #575e73;
    height: 39px;
    padding-right: 24px;
    border-top: 1px solid #eeeff0;
    padding-top: 30px;
  }

  .user-info-list .user-info-right .user-right-content .cehck-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 30px;
    padding: 0 0px 0 24px;
  }

  .user-info-list .user-info-right .user-right-title {
    padding: 0 0px 0 24px;
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    height: 40px;
    align-items: center;
  }

  .user-info-list .user-info-right .user-right-title .num {
    color: #494f6a;
  }

  .user-info-list .user-info-right .user-right-title .clear {
    color: #1e6fff;
    cursor: pointer;
  }

  .cehck-item .check-item-info {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .close-icon {
    width: 14px;
    min-width: 14px;
    height: 14px;
    cursor: pointer;
    color: #c2c5cf;
  }

  .check-item-info img {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    margin-right: 12px;
  }
  .user-info-body {
    position: relative;
    min-height: 200px;
  }
</style>
