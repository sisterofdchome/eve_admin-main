<template>
  <div>
    <Tool></Tool>
    <div class="knowledge-info-body">
      <div class="knowledge-left" style="width: 240px">
        <div class="knowledge-tree-search">
          <!-- <a-input-search v-model:value="value" placeholder="搜索" style="width: 200px" @search="onSearch" /> -->
          <a-input v-model:value="userName" placeholder="搜索">
            <template #prefix>
              <SearchOutlined />
            </template>
            <template #suffix>
              <a-tooltip title="Extra information">
                <info-circle-outlined style="color: rgba(0, 0, 0, 0.45)" />
              </a-tooltip>
            </template>
          </a-input>
          <a-dropdown>
            <BarsOutlined style="font-size: 16px; margin-left: 8px" />
            <template #overlay>
              <a-menu>
                <a-menu-item v-for="item in orderList" @click="orderIndex = item.id">
                  <div :class="item.id == orderIndex ? 'active' : ''">
                    <span class="check-icon">
                      <CheckOutlined v-if="item.id == orderIndex" />
                    </span>
                    {{ item.name }}
                  </div>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
        <div class="list-box">
          <!-- 添加加载状态 -->
          <a-spin :spinning="loading" tip="加载中...">
            <div v-if="fileList.length > 0" class="libary-item" v-for="(item, index) in fileList" @click="fileHandle(item)">
              <div class="content">
                <img v-if="item.type == 'folder'" src="../../assets/file/folder.png" height="20px" />
                <img v-else src="../../assets/file/doc.png" height="20px" />
                <div class="libary-info">
                  <div class="">
                    <div class="libary-name">{{ item.name }}</div>
                  </div>
                  <div class="libary-desc">{{ item.create_time }}</div>
                </div>
                <div class="action-box">
                  <a-popover trigger="click" placement="rightTop" overlayClassName="poperLayTable" v-model:visible="popoverVisible[index]" @click.stop>
                    <template #title>
                      <div class="more-items">
                        <div class="more-item" @click="editHandle(item, index)">
                          <span class="more-icon">
                            <FormOutlined />
                          </span>
                          <span class="more-name">编辑(已实现)</span>
                        </div>
                        <div v-if="item.type == 'file'" class="more-item">
                          <span class="more-icon">
                            <FormOutlined />
                          </span>
                          <span class="more-name" @click="editHandle(item, index)">重命名(已实现)</span>
                        </div>
                        <div class="more-item">
                          <span class="more-icon">
                            <DownloadOutlined />
                          </span>
                          <span class="more-name">下载</span>
                        </div>
                        <div class="more-item">
                          <span class="more-icon">
                            <LinkOutlined />
                          </span>
                          <span class="more-name">复制链接</span>
                        </div>
                        <div class="more-line"></div>
                        <div class="more-item">
                          <span class="more-icon">
                            <LinkOutlined />
                          </span>
                          <span class="more-name">复制文档</span>
                        </div>
                        <div class="more-item">
                          <span class="more-icon">
                            <ImportOutlined />
                          </span>
                          <span class="more-name">移动</span>
                        </div>
                        <div class="more-item">
                          <span class="more-icon">
                            <TagOutlined />
                          </span>
                          <span class="more-name">添加收藏</span>
                        </div>
                        <div class="more-item">
                          <span class="more-icon">
                            <BookOutlined />
                          </span>
                          <span class="more-name">添加标签</span>
                        </div>
                        <div class="more-line"></div>
                        <div class="more-item" @click="settingHandle(item, index)">
                          <span class="more-icon">
                            <SettingOutlined />
                          </span>
                          <span class="more-name">设置</span>
                        </div>
                        <div class="more-item" @click="showDeleteConfirm(item, index)">
                          <span class="more-icon">
                            <DeleteOutlined />
                          </span>
                          <span class="more-name">删除(已完成)</span>
                        </div>
                      </div>
                    </template>
                    <img src="../../assets/file/more.png" height="20px" />
                  </a-popover>
                </div>
              </div>
            </div>
            <div v-else class="no-data">暂无数据</div>
          </a-spin>
        </div>
      </div>
      <div class="tree-drop-width-line" style="left: 240px"></div>
      <div class="knowledge-right" style="width: calc(100% - 240px); height: calc(100vh - 127px); overflow: overlay">
        <div class="file-view-box"></div>
        <Comment></Comment>
      </div>
      <div class="knowledge-other"></div>
    </div>
    <Editor ref="editorRef" @updateSuccess="handleUpdateSuccess"></Editor>
    <Setting ref="settingRef"></Setting>
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
    ExpandAltOutlined,
    EllipsisOutlined,
    ReconciliationOutlined,
    UsergroupAddOutlined,
    SearchOutlined,
    CheckOutlined,
    ExclamationCircleOutlined,
  } from "@ant-design/icons-vue";
  import { ref, h, onMounted, reactive, watch } from "vue";
  import { useRoute } from "vue-router";
  import Tool from "./model/tool.vue";
  import Comment from "./model/comment.vue";
  import Setting from "./model/setting.vue";
  import Editor from "./model/editor.vue";
  import { message, Modal } from "ant-design-vue";
  import { postlibraryapi } from "../../api/index.js";
  import qs from "qs";
  import { useAppStore } from "../../store/module/app";

  import { storeToRefs } from "pinia";
  const appStore = useAppStore();

  // 二级目录数据
  const fileList = ref([]);
  const orderList = ref([
    { id: 1, name: "按时间排序(正序)" },
    { id: 2, name: "按时间排序(倒序)" },
    { id: 3, name: "按文件名排序(a-z)" },
    { id: 4, name: "按文件名排序(z-a)" },
  ]);
  const orderIndex = ref(1);
  const editorRef = ref(null);
  const settingRef = ref(null);
  const popoverVisible = ref([]);
  const userName = ref("");
  const loading = ref(false); // 新增加载状态

  // 引入appStore中的属性
  const { selectedKeys } = storeToRefs(appStore);
  const route = useRoute();

  const editHandle = (item, index) => {
    popoverVisible.value[index] = false;
    editorRef.value.showModal(item);
  };
  const settingHandle = (item, index) => {
    popoverVisible.value[index] = false;
    settingRef.value.showDrawer();
  };
  const showDeleteConfirm = (item, index) => {
    Modal.confirm({
      title: "确定删除吗?",
      icon: h(ExclamationCircleOutlined),
      okText: "是",
      okType: "danger",
      cancelText: "否",
      onOk() {
        folderDelete(item);
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };
  const folderDelete = async (item) => {
    const formData = {
      type: "delete",
      id_: item.id_,
    };
    const response = await postlibraryapi(qs.stringify(formData));
    console.log("接口请求成功:", response);
    if (response.data.code == 1) {
      message.success(response.data.msg);
      leftLibraryTree(selectedKeys.value);
    }
  };

  const fileHandle = (item) => {
    console.log(item);
    if (item.type == "folder") {
      leftLibraryTree(item.id_);
    } else if (item.type == "file") {
      // 文件
      console.log("文件");
      // 提示弹窗
      message.info("文件详情还在开发中！~");
    }
  };

  // 处理子组件editor传来的更新
  const handleUpdateSuccess = (updatedItem) => {
    const index = fileList.value.findIndex((item) => item.id_ === updatedItem.id_);
    if (index !== -1) {
      fileList.value[index].name = updatedItem.name; // 更新名称
    }
  };
  // 防抖函数
  const debounce = (fn, delay) => {
    let timer = null;
    return (...args) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        fn(...args);
        timer = null;
      }, delay);
    };
  };
  /**
   * 获取下一级目录list
   */
  const fetchLibraryTree = async (id) => {
    loading.value = true; // 开始加载
    fileList.value = [];
    const formData = {
      type: "list",
      pid: id,
    };
    try {
      const response = await postlibraryapi(qs.stringify(formData));
      console.log("接口请求成功:", response);
      if (response.data.code == 1) {
        fileList.value = response.data.obj.data;
        console.log(fileList.value);
      }
    } catch (error) {
      console.error("接口请求失败:", error);
    } finally {
      loading.value = false; // 加载完成
    }
  };
  // 应用防抖的 leftLibraryTree
  const leftLibraryTree = debounce(fetchLibraryTree, 300); // 300ms 防抖

  // 初始化时调用
  onMounted(() => {
    const id = route.query.id;
    console.log("组件挂载时接收到的参数:", id);
    if (id) {
      leftLibraryTree(id);
    }
  });
  // 监听路由参数变化
  // watch(
  //   () => route.query.id,
  //   (newId, oldId) => {
  //     console.log("路由参数 id 变化:", { newId, oldId });
  //     leftLibraryTree(newId);
  //   }
  // );
  // 监听refreshKey变化
  watch(
    () => appStore.refreshKey,
    () => {
      leftLibraryTree(selectedKeys.value); // 重新获取当前路由的文件列表
    }
  );
</script>
<style scoped>
  .knowledge-left {
    max-width: 350px;
    min-width: 240px;
  }

  .tree-drop-width-line {
    height: 22px;
    width: 22px;
    min-width: 22px;
    position: absolute;
    z-index: 9;
    cursor: col-resize;
    display: flex;
    align-items: center;
    justify-content: center;
    top: 50%;
    transform: translate(calc(-50% + 2px)) translateY(-50%);
  }

  .knowledge-right {
    border-left: 1px solid #f5f6f7;
  }

  .knowledge-other {
    position: fixed;
    right: 0;
    height: calc(100vh - 112px);
    max-width: 268px;
    z-index: 6;
  }

  .knowledge-tree-search {
    margin-right: 16px;
    margin-bottom: 8px;
    margin-left: 24px;
    display: flex;
    align-items: center;
  }

  .libary-item {
    height: 52px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .libary-item:hover {
    background-color: #ddeaff;
  }

  .libary-info {
    margin-left: 12px;
    width: 146px;
    overflow: hidden;
  }

  .content {
    display: flex;
    align-items: center;
    padding-left: 16px;
    width: 100%;
  }

  .content:hover .action-box img {
    visibility: visible;
  }

  .action-box {
    width: 20px;
    height: 20px;
    cursor: pointer;
    border: none;
    position: relative;
  }

  .action-box :hover {
    background: #edf4ff;
    border-radius: 4px;
  }

  .action-box img {
    visibility: hidden;
  }

  .libary-name,
  .libary-desc {
    font-size: 14px;
    color: #363b4c;
    width: calc(100% + -0px);
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    line-height: 20px;
  }

  .libary-desc {
    color: #6f7588;
    font-size: 12px;
    line-height: 16px;
  }

  .list-box {
    height: calc(100vh - 164px);
    padding-left: 8px;
    overflow: overlay;
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

  .file-view-box {
    width: 100%;
    padding-right: 8px;
    position: relative;
    box-sizing: border-box;
    min-height: calc(100vh - 252px);
  }

  .knowledge-info-body {
    display: flex;
    height: calc(100% - 44px);
    position: relative;
  }
  .check-icon {
    width: 16px;
    height: 16px;
    margin-right: 3px;
    display: inline-block;
  }
  .active {
    color: #1e6fff;
  }

  /* 加载样式 */
  .no-data {
    text-align: center;
    color: #6f7588;
    font-size: 14px;
    padding: 20px;
  }
</style>
