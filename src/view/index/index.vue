<template>
  <div>
    <div class="title">常用文库</div>

    <!-- 添加加载状态 -->
    <a-spin :spinning="loading" tip="加载中...">
      <div class="library">
        <a-card
          hoverable
          style="width: 150px; height: 200px"
          :class="{ 'hover-card': item.isHover }"
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
        </a-card>
        <div v-else><a-empty /></div>
      </div>
    </a-spin>
  </div>
  <div class="types-box">
    <div class="types-left">
      <!-- 动态绑定 class，根据 activeTab 切换样式 -->
      <div class="type-left" :class="{ active: activeTab === 'preview' }" @click="activeTab = 'preview'">最近预览</div>
      <div class="type-left" :class="{ active: activeTab === 'edit' }" @click="activeTab = 'edit'">最近编辑</div>
    </div>
    <div class="types-right">
      <div class="el-dropdown"></div>
      <div class="view-type-box"></div>
    </div>
  </div>
</template>

<script setup>
  // 新增图标引入
  import { EyeOutlined, DownloadOutlined, SettingOutlined, DeleteOutlined } from "@ant-design/icons-vue";
  import { ref, reactive, onMounted, h } from "vue";
  import { useRoute } from "vue-router";
  import { postlibraryapi } from "../../api/index";
  import qs from "qs";
  import { Modal, message } from "ant-design-vue";
  import { useRouter } from "vue-router";
  import { storeToRefs } from "pinia";

  // 引入appStore
  import { useAppStore } from "../../store/module/app";
  const appStore = useAppStore();
  // 引入appStore中的属性
  const { sideCollapsed, theme, menu, selectedKeys, openKeys } = storeToRefs(appStore);
  const route = useRoute();

  const libraryData = ref([]);
  // 默认激活 "preview"（最近预览）
  const activeTab = ref("preview");
  const loading = ref(false); // 新增加载状态
  const router = useRouter();

  onMounted(() => {
    fetchLibraryList();
  });
  const handleLibraryClick = (item) => {
    if (item.url) {
      selectedKeys.value = item.id_;
      router.push({
        path: item.url, // 直接使用配置的 url
        query: {
          id: item.id_,
          title: item.name,
        },
      });
    }
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
        console.log(libraryData.value);
      }
    } catch (error) {
      console.error("接口请求失败:", error);
    } finally {
      loading.value = false; // 加载完成
    }
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
  /* 最近预览 编辑 切换 */
  .types-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 20px;
    /* margin-top: 10px; */
    /* border-top: 1px solid #eee; */
  }
  .types-left {
    display: flex;
    gap: 20px; /* 两个标签之间的间距 */
  }
  .type-left {
    cursor: pointer;
    font-size: 16px;
    color: #666;
    transition: all 0.3s; /* 平滑过渡效果 */
  }
  /* 激活状态的样式：加粗 + 放大 + 主题色 */
  .type-left.active {
    font-weight: bold;
    font-size: 20px;
    color: #000000; /* 示例主题色（可调整） */
  }

  .ant-card-cover {
    padding: 12px;
  }
</style>
