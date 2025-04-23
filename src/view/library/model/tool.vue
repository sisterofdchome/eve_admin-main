<template>
  <div class="knowledge-info-top-tool" style="z-index: 10">
    <div class="tool-left">
      <a-breadcrumb>
        <a-breadcrumb-item v-for="(item, index) in breadValue" :key="index" @click="handleBreadItemClick(item, index)" style="cursor: pointer">
          {{ item.name }}
        </a-breadcrumb-item>
      </a-breadcrumb>
      <div class="goback" @click="handleBreadCrumbClick">
        <img src="../../../assets/libary/leftBack.png" alt="" style="height: 16px; width: 20px" />
      </div>
    </div>
    <div class="tool-right">
      <!-- <div v-if="fileVisible" class="action-button hover-back">
        <div v-if="isFavorite == '0'" @click="collectHandleOk(collectValue)">
          <TagOutlined class="tool-icon" />
          <span>收藏</span>
        </div>
        <div v-else>
          <TagOutlined class="tool-icon" style="color: #1e6fff" @click="folderDelete(isFavorite)" />
          <span>取消收藏</span>
        </div>
      </div> -->
      <div v-if="fileVisible" class="action-button hover-back">
        <div @click="handleCollect">
          <TagOutlined :style="{ color: appStore.isFavorite !== 0 ? '#1e6fff' : '' }" />
          <span>{{ appStore.isFavorite !== 0 ? "取消收藏" : "收藏" }}</span>
        </div>
      </div>
      <!-- <div v-if="fileVisible" class="action-button hover-back">
        <FullscreenOutlined class="tool-icon" />
        <span>全屏</span>
      </div> -->
      <div v-if="fileVisible" class="action-button hover-back" @click="toggleFullscreen">
        <template v-if="!isFullscreen">
          <FullscreenOutlined class="tool-icon" />
          <span>全屏</span>
        </template>
        <template v-else>
          <FullscreenExitOutlined class="tool-icon" />
          <span>取消全屏</span>
        </template>
      </div>
      <a-popover v-if="fileVisible" placement="bottom" trigger="click">
        <template #content>
          <!-- <div class="more-item more-item-top">
            <span class="more-icon">
              <LinkOutlined />
            </span>
            <span class="more-name">复制链接</span>
          </div> -->
          <div class="more-item more-item-top" @click="downloadFile">
            <span class="more-icon">
              <DownloadOutlined />
            </span>
            <span class="more-name">文档下载</span>
          </div>
          <!-- <div class="more-item more-item-top">
            <span class="more-icon">
              <SettingOutlined />
            </span>
            <span class="more-name">文档设置</span>
          </div> -->
        </template>
        <div class="action-button hover-back">
          <EllipsisOutlined class="tool-icon" />
          <span>更多</span>
        </div>
      </a-popover>

      <div class="more-acitons-line"></div>
      <div class="more-actions">
        <a-popover placement="bottom">
          <template #content> 文库信息 </template>
          <div class="icon-box" @click="settingHandle">
            <ReconciliationOutlined />
          </div>
        </a-popover>
        <a-popover placement="bottom">
          <template #content> 协同人员 </template>
          <div class="icon-box" @click="userHandle">
            <UsergroupAddOutlined />
          </div>
        </a-popover>
      </div>
    </div>
    <Information ref="informationRef"></Information>
    <Personnel ref="personnelRef"></Personnel>
  </div>
</template>

<script lang="js" setup>
  import {
    BarsOutlined,
    DownloadOutlined,
    LinkOutlined,
    CopyOutlined,
    ImportOutlined,
    TagOutlined,
    BookOutlined,
    SettingOutlined,
    DeleteOutlined,
    FormOutlined,
    FullscreenOutlined,
    FullscreenExitOutlined,
    EllipsisOutlined,
    ReconciliationOutlined,
    UsergroupAddOutlined,
    RollbackOutlined,
  } from "@ant-design/icons-vue";

  import { ref, h, onMounted, reactive, watch } from "vue";
  import { defineProps } from "vue";

  import Information from "./libraryInformation.vue";
  import Personnel from "./personnel.vue";
  import { postDownloadFile } from "../../../api/index.js";
  import qs from "qs";
  import { message } from "ant-design-vue";

  // 引入appStore
  import { useAppStore } from "../../../store/module/app";
  import { storeToRefs } from "pinia";
  import { useRouter } from "vue-router";
  const router = useRouter();
  const appStore = useAppStore();
  // 引入appStore中的属性
  const { selectedKeys, breadValue, breadLength, fileVisible, backLibrary, breadChanges, selectedChildren, breadLastId, selectedFileId } = storeToRefs(appStore);

  const informationRef = ref(null);
  const personnelRef = ref(null);

  // 接收父组件传递的全屏状态和方法
  const props = defineProps({
    isFullscreen: Boolean,
    toggleFullscreen: Function,
    fileItem: Object,
  });

  // 文库信息弹窗
  const settingHandle = (item, index) => {
    console.log(item);
    appStore.triggerStatusRefresh(); // 只触发文库设置刷新
    informationRef.value.showDrawer(item);
  };
  // 人员设置弹窗
  const userHandle = (item, index) => {
    console.log(item);

    personnelRef.value.showDrawer(item);
  };
  // 面包屑返回
  const handleBreadCrumbClick = () => {
    if (breadValue.value.length == 2) {
      // breadLength.value = true;
      // 跳转到第一个面包屑的URL
      router.push(breadValue.value[0].url);
      selectedKeys.value = -12;
      backLibrary.value = true;
      fileVisible.value = false;
    } else {
      fileVisible.value = false;
      appStore.backBread();
    }
  };
  // 新增：处理面包屑项点击
  const handleBreadItemClick = (item, index) => {
    console.log("面包屑处理前", breadValue.value);
    if (index === breadValue.value.length - 1) {
      // 如果点击的是最后一项，不执行任何操作
      return;
    }
    // 如果是第一项，返回全部文库
    if (index === 0) {
      breadValue.value = breadValue.value.slice(0, 2);
      router.push(breadValue.value[0].url);
      selectedKeys.value = -12;
      backLibrary.value = true;
      fileVisible.value = false;
      return;
    }

    // 截断面包屑到点击的项（包含该项）
    breadValue.value = breadValue.value.slice(0, index + 1);

    // 更新 selectedKeys 和 selectedChildren
    // selectedKeys.value = item.id;
    appStore.selectChildren(item.id);

    // 跳转到对应 URL
    router.push(item.url);
    fileVisible.value = false;
    breadLastId.value = breadValue.value[breadValue.value.length - 1].id;
    // 当前返回项的id
    selectedChildren.value = breadLastId.value;
    breadChanges.value++;
    console.log("面包屑处理后", breadValue.value);
  };
  // 本地收藏方法，调用 Store
  const handleCollect = () => {
    if (props.fileItem) {
      appStore.toggleFavorite(props.fileItem).then(() => {
        // 强制刷新父组件数据
        appStore.triggerRefresh();
      });
    }
  };

  // 文件下载
  const downloadFile = async () => {
    const formData = {
      sf: "1",
      code: selectedFileId.value,
    };
    const response = await postDownloadFile(qs.stringify(formData));

    console.log("接口请求成功:", response);
    if (response.data.result) {
      message.success("操作成功");
      window.location.href = "https://oa.scnjwh.com/luqiao//jxload/view.pdf?code=" + response.data.message; // 触发文件下载
    } else {
      message.error("下载失败");
    }
  };
</script>

<style>
  .goback {
    /* 光标改为手指 */
    cursor: pointer;
    margin-left: 4px;
  }
  .knowledge-info-top-tool {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 24px;
    height: 42px;
    margin-bottom: 8px;
    margin-left: 24px;
    width: calc(100% - 15px);
    padding-top: 10px;
  }
  .tool-left {
    display: flex;
    align-items: center;
  }

  .tool-right .action-button + .action-button {
    margin-left: 4px;
  }

  .tool-right {
    display: flex;
    align-items: center;
    word-break: keep-all;
  }

  .tool-right .hover-back {
    padding: 0 5px;
  }

  .tool-right .action-button {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    cursor: pointer;
  }
  .tool-right .more-acitons-line {
    width: 1px;
    height: 24px;
    background: #f0f1f2;
    margin-left: 16px;
  }

  .tool-right .tool-icon {
    cursor: pointer;
    margin-right: 2px;
    font-size: 18px !important;
    outline: none !important;
    display: flex;
    align-items: center;
  }

  .tool-right .action-button span {
    font-size: 12px;
    margin-left: 2px;
  }

  .more-actions {
    height: 32px;
    display: flex;
    align-items: center;
    padding: 0 7px 0 9px;
    margin-left: 7px;
  }

  .more-actions .icon-box {
    width: 30px;
    height: 30px;
    border-radius: 4px;
    cursor: pointer;
    background-color: #eeeff0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .more-actions .icon-box + .icon-box {
    margin-left: 10px;
  }

  .hover-back:hover {
    background: #f5f6f7 !important;
  }

  .more-item {
    padding: 0 16px 0 12px;
    cursor: pointer;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    color: #363b4c;
    font-weight: 500;
  }

  .more-item .more-icon {
    width: 16px;
    height: 16px;
    font-size: 16px;
    display: flex;
    align-items: center;
  }

  .more-item .more-name {
    flex: 2;
    margin-left: 8px;
  }

  .more-line {
    margin: 8px 0;
    background: #d7d8db;
    height: 1px;
    width: 100%;
  }

  .more-items {
    padding: 8px 0;
    width: 140px;
  }

  .more-item:hover {
    background-color: #eeeff0;
  }
</style>
