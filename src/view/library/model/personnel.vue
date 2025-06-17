<template>
  <a-drawer title="协同人员" :placement="placement" :closable="false" :visible="visible" @close="onClose" width="450px" class="setting-drawer">
    <div class="know-set-body">
      <!-- <span> 文件夹： {{ selectedChildren }}</span> -->

      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane key="1" tab="成员">
          <!--          <div class="user-item">-->
          <!--                        <div class="user-head"><img src="../../../assets/libary/personnel.png" style="width: 100%; height: 100%" /></div>-->
          <!--                        <span class="user-name">系统管理员</span>-->
          <!--          </div>-->
          <a-spin :spinning="loading">
            <div style="height: 580px; overflow-y: auto">
              <div class="user-item" v-for="item in members.data" :key="item.id_">
                <div class="user-head"><img src="@/assets/libary/personnel.png" style="width: 100%; height: 100%" /></div>
                <div>
                  <div class="user-name">{{ item.user_name }}</div>
                  <div style="font-size: 12px; color: #c2ccd0">{{ item.create_time }}</div>
                </div>
              </div>
            </div>
          </a-spin>
          <div class="pagination">
            <a-pagination
              size="small"
              :current="memberPagination.pageNum"
              :pageSize="memberPagination.pageSize"
              :total="memberPagination.total"
              show-size-changer
              :show-total="(total) => '共' + total + '条记录'"
              @change="onMemberPageChange"
              @showSizeChange="onMemberPageSizeChange"
            />
          </div>
        </a-tab-pane>
        <a-tab-pane key="2" tab="动态" force-render>
          <a-spin :spinning="loading">
            <div style="height: 580px; overflow-y: auto">
              <div class="dyn-item" v-for="item in logList.data" :key="item.id_">
                <div class="oper-user">
                  <div class="name-info">
                    <img src="../../../assets/libary/personnel.png" />
                    <span class="name" title="系统管理员">{{ item.create_name }}</span>
                  </div>
                  <span class="time">{{ item.create_time }}</span>
                </div>
                <!-- <span class="oper-name">{{ item.description }}</span> -->
                <div class="dc-info">
                  <span class="dc-box el-tooltip__trigger el-tooltip__trigger"
                    ><img src="../../../assets/libary/icon-wjj.png" class="icon" /><span data-v-9d2aa61e="">{{ item.description }}</span></span
                  >
                </div>
              </div>
            </div>
          </a-spin>
          <div class="pagination">
            <a-pagination
              size="small"
              :current="logPagination.pageNum"
              :pageSize="logPagination.pageSize"
              :total="logPagination.total"
              :show-total="(total) => '共' + total + '条记录'"
              show-size-changer
              show-quick-jumper
              @change="onLogPageChange"
              @showSizeChange="onLogPageSizeChange"
            />
          </div>
          <!-- <div class="dyn-item">
            <div class="oper-user">
              <div class="name-info">
                <img src="../../../assets/libary/personnel.png" />
                <span class="name" title="系统管理员">系统管理员</span>
                <span class="oper-name">新增</span>
              </div>
              <span class="time">昨天 17:31</span>
            </div>
            <div class="dc-info">
              <span class="dc-box el-tooltip__trigger el-tooltip__trigger"><img src="../../../assets/libary/icon-word.png" class="icon" /><span data-v-9d2aa61e="">frfrfr</span></span>
            </div>
          </div> -->
        </a-tab-pane>
      </a-tabs>
    </div>
  </a-drawer>
</template>

<script setup>
  import { ref, reactive, watch, onMounted, toRefs } from "vue";
  import { FileZipOutlined, SettingOutlined } from "@ant-design/icons-vue";
  import { message } from "ant-design-vue";
  import { postlibraryapi, getLogApi, postPermissionApi } from "../../../api/index.js";
  import { useAppStore } from "../../../store/module/app.js";
  import qs from "qs";

  import { storeToRefs } from "pinia";

  const appStore = useAppStore();

  const { selectedKeys, selectedChildren } = storeToRefs(appStore);
  const members = ref([]);

  // 接收父组件传递的 props
  const props = defineProps({
    title: {
      type: String, // 类型可以根据需要调整，例如 Number, Object 等
      default: "", // 默认值
    },
  });

  const activeKey = ref("1");
  const personRef = ref(null);
  const loading = ref(false);

  const formState = reactive({
    classification_name: "",
    number_files: "",
    create_name: "",
    create_time: "",
    update_time: "",
    size: "",
  });

  // 成员分页
  const memberPagination = reactive({
    pageNum: 1,
    pageSize: 10,
    total: 0,
  });
  // 日志分页
  const logPagination = reactive({
    pageNum: 1,
    pageSize: 10,
    total: 0,
  });

  onMounted(async () => {});
  const getLibraryImformation = async () => {};

  const visible = ref(false);
  const placement = ref("right");
  const onClose = () => {
    visible.value = false;
  };

  const id_ = ref("");
  const logList = ref([]);
  const showDrawer = async (item) => {
    console.log(item);
    visible.value = true;

    loading.value = true;
    // 获取成员列表
    await showMember(item);
    // 获取日志列表
    await showLogList(item);
    loading.value = false;
  };

  const showMember = async (item) => {
    const data = {
      type: "page",
      classification_tree_id: selectedChildren.value,
      pageNum: memberPagination.pageNum,
      pageSize: memberPagination.pageSize,
    };
    const response = await postPermissionApi(qs.stringify(data));
    if (response.data.obj.error == "") {
      members.value = response.data.obj.data;
      memberPagination.total = response.data.obj.data.count || 0;
    }
  };
  const showLogList = async () => {
    const data = {
      type: "page",
      record_id: selectedChildren.value,
      pageNum: logPagination.pageNum,
      pageSize: logPagination.pageSize,
    };
    const response = await getLogApi(qs.stringify(data));
    if (response.data.obj.error === "") {
      logList.value = response.data.obj.data;
      logPagination.total = response.data.obj.data.count || 0;
    }
  };

  // 获取成员列表
  const onMemberPageChange = async (page, pageSize) => {
    memberPagination.pageNum = page;
    memberPagination.pageSize = pageSize;

    loading.value = true;
    await showMember(); // 重新加载成员

    loading.value = false;
  };

  const onMemberPageSizeChange = async (current, size) => {
    memberPagination.pageNum = 1;
    memberPagination.pageSize = size;
    loading.value = true;
    await showMember();
    loading.value = false;
  };

  // 显示日志
  const onLogPageChange = async (page, pageSize) => {
    logPagination.pageNum = page;
    logPagination.pageSize = pageSize;
    loading.value = true;
    await showLogList();
    loading.value = false;
  };

  const onLogPageSizeChange = async (current, size) => {
    logPagination.pageNum = 1;
    logPagination.pageSize = size;
    loading.value = true;
    showLogList();
    loading.value = false;
  };

  // watch(
  //   () => appStore.refreshKey,
  //   () => {
  //     getLibraryImformation(); // 重新获取当前路由的文件列表
  //   }
  // );

  // 定义事件
  const emit = defineEmits(["updateSuccess"]);

  defineExpose({
    showDrawer,
  });
</script>

<style scoped>
  .setting-drawer {
    display: flex;
    height: 100%;
    width: 100%;
  }

  .know-set-body {
    padding: 2px 20px;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .user-item {
    display: flex;
    align-items: center;
    padding: 8px 0;
    transition: background-color 0.2s;
    cursor: default;
  }

  .user-item:hover {
    background-color: #f5f7fa;
    border-radius: 4px;
    padding-left: 4px;
  }

  .user-head {
    width: 32px;
    height: 32px;
    min-width: 32px;
    border-radius: 6px;
    overflow: hidden;
    margin-right: 12px;
  }

  .user-name {
    font-size: 14px;
    color: #2f2f2f;
    font-weight: 500;
  }

  .dyn-item {
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
  }

  .oper-user {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .name-info {
    display: flex;
    align-items: center;
  }

  .name-info img {
    width: 24px;
    height: 24px;
    border-radius: 4px;
  }

  .name-info .name {
    color: #363b4c;
    margin-left: 8px;
    font-size: 14px;
    font-weight: 500;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .oper-name {
    color: #6f7588;
    font-size: 14px;
    margin-left: 8px;
  }

  .dc-info {
    margin-left: 32px;
    margin-top: 6px;
    background: #f4f5f6;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 13px;
    color: #444;
    display: flex;
    align-items: center;
  }

  .dc-box {
    display: flex;
    align-items: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
  }

  .dc-box span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .icon {
    width: 14px;
    height: 14px;
    margin-right: 8px;
  }

  .pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
    border-top: 1px solid #f0f0f0;
    padding-top: 12px;
  }
</style>
