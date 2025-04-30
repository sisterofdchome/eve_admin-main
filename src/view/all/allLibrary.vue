<template>
  <div>
    <div class="title">{{ title }}</div>

    <!-- 添加加载状态 -->
    <a-spin :spinning="loading" tip="加载中...">
      <div class="library">
        <a-card
          hoverable
          style="width: 150px; height: 200px"
          :class="{ 'hover-card': item.isHover }"
          @mouseenter="() => handleHover(item, true)"
          @mouseleave="() => handleHover(item, false)"
          v-if="libraryData.length > 0"
          v-for="item in libraryData"
          :key="item.id_"
          @click="handleLibraryClick(item)"
        >
          <template #cover>
            <!-- 使用默认封面或动态封面 -->
            <img alt="example" src="../../assets/libary/cover.png" v-if="!item.cover" />
            <img v-else :src="item.cover" alt="自定义封面" />
          </template>
          <a-card-meta :title="item.name" style="align-items: center">
            <!-- 可选：显示文件数量 -->
            <template #description v-if="item.description"> {{ item.description }} </template>
          </a-card-meta>

          <!-- 新增悬停遮罩层 -->
          <div class="hover-mask" v-show="item.isHover">
            <div class="button-group">
              <!-- <div>
                <a-button type="text" class="action-btn">
                  <template #icon><EyeOutlined /></template>
                </a-button>
                <a-button type="text" class="action-btn">
                  <template #icon><DownloadOutlined /></template>
                </a-button>
              </div> -->
              <div>
                <a-button type="text" class="action-btn" @click.stop="settingHandle(item, index)">
                  <template #icon><SettingOutlined /></template>设置
                </a-button>
                <a-button type="text" class="action-btn" @click.stop="showDeleteConfirm(item)">
                  <template #icon><DeleteOutlined /></template>删除
                </a-button>
              </div>
            </div>
          </div>
        </a-card>
        <div v-else><a-empty /></div>
      </div>
    </a-spin>

    <Setting ref="settingRef" @updateSuccess="handleUpdateSuccess"></Setting>
  </div>
</template>

<script setup>
  // 新增图标引入
  import { EyeOutlined, DownloadOutlined, SettingOutlined, DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons-vue";
  import { ref, reactive, onMounted, h } from "vue";
  import { useRoute } from "vue-router";
  import { postlibraryapi } from "../../api/index";
  import qs from "qs";
  import { Modal, message } from "ant-design-vue";
  import { useRouter } from "vue-router";
  import { storeToRefs } from "pinia";

  import Setting from "../library/model/setting.vue";

  // 引入appStore
  import { useAppStore } from "../../store/module/app";
  const appStore = useAppStore();
  // 引入appStore中的属性
  const { selectedChildren, selectedKeys, openKeys, breadValue, backLibrary, fileVisible } = storeToRefs(appStore);
  const route = useRoute();

  // const title = ref(route.query.title);
  const libraryData = ref([]);
  const loading = ref(false); // 新增加载状态
  const router = useRouter();
  const settingRef = ref(null);

  // 使用props接收参数
  const props = defineProps({
    title: {
      type: String,
      required: true,
    },
  });

  onMounted(() => {
    console.log(props.title);
    fetchLibraryList();
  });
  const handleLibraryClick = (item) => {
    console.log(item);
    router.push(`${item.url}/${item.id_}`);
    selectedKeys.value = item.id_;

    breadValue.value[0] = { id: 0, name: "全部文库", url: "/allLibrary/全部文库" };
    breadValue.value[1] = { id: item.id_, name: item.name, url: `item.url${item.id_}` };
    backLibrary.value = true;

    fileVisible.value = false;
    selectedChildren.value = item.id_;

    // if (item.url) {
    //   selectedKeys.value = item.id_;
    //   router.push({
    //     path: item.url, // 直接使用配置的 url
    //     query: {
    //       id: item.id_,
    //       title: item.name,
    //     },
    //   });
    // }
  };
  /**
   * 获取文库list
   */
  const fetchLibraryList = async () => {
    loading.value = true; // 开始加载
    const formData = {
      type: "list",
      pid: 0,
    };
    try {
      const response = await postlibraryapi(qs.stringify(formData));
      console.log("接口请求成功:", response);
      if (response.data.code == 1) {
        console.log(1);
        libraryData.value = response.data.obj.data;
        libraryData.value.forEach((item, index) => {
          item.url = "/library";
        });
        // 在获取数据后初始化hover状态
        libraryData.value = response.data.obj.data.map((item) => ({
          ...item,
          isHover: false,
          url: "/library",
        }));
        console.log(libraryData.value);
      }
    } catch (error) {
      console.error("接口请求失败:", error);
    } finally {
      loading.value = false; // 加载完成
    }
  };

  const settingHandle = (item, index) => {
    settingRef.value.showDrawer(item);
  };
  // 删除弹框
  const showDeleteConfirm = (item, index) => {
    Modal.confirm({
      title: "确认删除此知识库？",
      icon: h(ExclamationCircleOutlined),
      okText: "是",
      okType: "danger",
      cancelText: "否",
      onOk() {
        handleDelete(item);
      },
    });
  };
  // 删除文库
  const handleDelete = async (item) => {
    const formData = {
      type: "delete",
      id_: item.id_,
    };
    try {
      const response = await postlibraryapi(qs.stringify(formData));
      console.log("接口请求成功:", response);
      if (response.data.obj.error == "") {
        message.success("删除成功");
        fetchLibraryList();
        appStore.triggerLeftLibraryRefresh(); // 触发文库列表更新
      } else {
        message.error(response.data.obj.error);
      }
    } catch (error) {}
  };

  // 悬停状态控制
  const handleHover = (item, state) => {
    item.isHover = state;
  };
  // 处理子组件header传来的更新
  const handleUpdateSuccess = (key, title) => {
    fetchLibraryList();
  };
</script>

<style scoped>
  .library {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    padding: 0 20px;
    grid-column-gap: 26px;
    grid-row-gap: 16px;
  }
  .title {
    margin: 14px 20px;
    font-size: 20px;
    font-family: SourceHanSansCN-Bold !important;
    color: #363b4c;
    font-weight: bold;
  }
  /* 悬停效果样式 */
  .hover-card {
    position: relative;
    background: #e6f7ff !important;
    transition: all 0.3s ease;
  }

  .hover-mask {
    position: absolute;
    top: -2px;
    left: -2px;
    width: 152px;
    height: 202px;
    background: rgba(24, 144, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
  }

  .button-group {
    /* display: flex;
    gap: 12px; */
  }

  .action-btn {
    color: white !important;
    background: transparent !important;
    border-color: transparent !important;
    width: 100%;
  }

  .action-btn:hover {
    background: rgba(255, 255, 255, 0.2) !important;
  }
  .ant-card-body {
    padding: 16px;
  }
</style>
