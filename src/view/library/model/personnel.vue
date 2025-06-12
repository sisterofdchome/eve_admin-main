<template>
  <a-drawer title="协同人员" :placement="placement" :closable="false" :visible="visible" @close="onClose" width="450px" class="setting-drawer">
    <div class="know-set-body">
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane key="1" tab="成员"
          ><div class="user-item">
            <div class="user-head"><img src="../../../assets/libary/personnel.png" style="width: 100%; height: 100%" /></div>
            <span class="user-name">系统管理员</span>
          </div></a-tab-pane
        >
        <a-tab-pane key="2" tab="动态" force-render>
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
  import { postlibraryapi, getLogApi } from "../../../api/index.js";
  import { useAppStore } from "../../../store/module/app.js";
  import qs from "qs";

  import { storeToRefs } from "pinia";

  const appStore = useAppStore();

  const { selectedKeys } = storeToRefs(appStore);
  // 接收父组件传递的 props
  const props = defineProps({
    title: {
      type: String, // 类型可以根据需要调整，例如 Number, Object 等
      default: "", // 默认值
    },
  });

  const activeKey = ref("1");
  const personRef = ref(null);

  const formState = reactive({
    classification_name: "",
    number_files: "",
    create_name: "",
    create_time: "",
    update_time: "",
    size: "",
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

    const data = {
      type: "page",
    };
    const response = await getLogApi(qs.stringify(data));

    if (response.data.obj.error == "") {
      console.log(response);
      logList.value = response.data.obj.data;
      console.log(logList.value);
    }
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
    padding: 0 20px;
  }
  .user-item {
    display: flex;
    align-items: center;
    padding-right: 24px;
    box-sizing: border-box;
  }
  .user-head {
    width: 32px;
    height: 32px;
    min-width: 32px;
    border-radius: 6px;
    overflow: hidden;
    margin-right: 16px;
  }
  .dyn-item {
    padding-right: 24px;
    margin-bottom: 16px;
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
    min-width: 24px;
    width: 24px;
    height: 24px;
    border-radius: 6px;
  }
  .name-info .name {
    color: #363b4c;
    margin-left: 8px;
    font-size: 14px;
    max-width: 50px;
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
    margin-top: 4px;
    width: calc(100% - 32px);
    background: #f4f5f6;
    padding: 0 8px;
    box-sizing: border-box;
    border-radius: 2px;
    height: 24px;
  }
  .dc-box {
    width: calc(100% + -0px);
    display: flex;
    align-items: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .dc-box span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .icon {
    width: 14px;
    min-width: 14px;
    height: 14px;
    margin-right: 8px;
  }
</style>
