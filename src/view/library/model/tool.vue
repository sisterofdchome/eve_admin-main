<template>
  <div class="knowledge-info-top-tool">
    <div class="tool-left">
      <a-breadcrumb>
        <a-breadcrumb-item v-for="(item, index) in breadValue" :key="index">
          {{ item.name }}
        </a-breadcrumb-item>
      </a-breadcrumb>
      <div class="goback" @click="handleBreadCrumbClick">
        <img src="../../../assets/libary/leftBack.png" alt="" style="height: 16px; width: 20px" />
      </div>
    </div>
    <div class="tool-right">
      <!-- <div class="action-button hover-back">
        <TagOutlined class="tool-icon" />
        <span>收藏</span>
      </div>
      <div class="action-button hover-back">
        <FullscreenOutlined class="tool-icon" />
        <span>全屏</span>
      </div>
      <a-popover placement="bottom" trigger="click">
        <template #content>
          <div class="more-item more-item-top">
            <span class="more-icon">
              <LinkOutlined />
            </span>
            <span class="more-name">复制链接</span>
          </div>
          <div class="more-item more-item-top">
            <span class="more-icon">
              <DownloadOutlined />
            </span>
            <span class="more-name">文档下载</span>
          </div>
          <div class="more-item more-item-top">
            <span class="more-icon">
              <SettingOutlined />
            </span>
            <span class="more-name">文档设置</span>
          </div>
        </template>
        <div class="action-button hover-back">
          <EllipsisOutlined class="tool-icon" />
          <span>更多</span>
        </div>
      </a-popover> -->

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
    EllipsisOutlined,
    ReconciliationOutlined,
    UsergroupAddOutlined,
    RollbackOutlined,
  } from "@ant-design/icons-vue";

  import { ref, h, onMounted, reactive, watch } from "vue";
  import { defineProps } from "vue";

  import Information from "./libraryInformation.vue";
  import Personnel from "./personnel.vue";

  // 引入appStore
  import { useAppStore } from "../../../store/module/app";
  import { storeToRefs } from "pinia";
  import { useRouter } from "vue-router";
  const router = useRouter();
  const appStore = useAppStore();
  // 引入appStore中的属性
  const { selectedKeys, breadValue, breadLength } = storeToRefs(appStore);

  const informationRef = ref(null);
  const personnelRef = ref(null);

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
    } else {
      appStore.backBread();
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
