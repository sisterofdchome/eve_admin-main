<template>
  <div>
    <Tool :isFullscreen="isFullscreen" :toggleFullscreen="toggleFullscreen" :collectValue="menuIndex" :fileItem="fileList.find((item) => item.id_ === menuIndex)"></Tool>
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
                <a-menu-item v-for="item in orderList" @click="changeOrderList(item)">
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
        <a-spin :spinning="loading" tip="加载中...">
          <div class="list-box">
            <!-- 添加加载状态 -->
            <div
              v-if="fileList.length > 0"
              class="libary-item"
              :class="menuIndex == item.id_ ? 'libary-item silder-item-active' : 'libary-item'"
              v-for="(item, index) in fileList"
              @click="fileHandle(item)"
            >
              <div class="content">
                <!-- {{ item.file_suffix }} -->
                <img v-if="item.type == 'folder'" src="../../assets/file/folder.png" height="20px" />
                <!-- <img v-else src="../../assets/file/doc.png" height="20px" /> -->
                <!-- file_extension -->
                <img v-else :src="'../../assets/file/' + item.file_suffix + '.png'" style="height: 20px" />
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
                        <div class="more-item" @click="editHandle(item, index)" v-if="item.type != 'file'">
                          <span class="more-icon">
                            <FormOutlined />
                          </span>
                          <span class="more-name">编辑( √ )</span>
                        </div>
                        <div class="more-item" v-else>
                          <span class="more-icon">
                            <FormOutlined />
                          </span>
                          <span class="more-name">编辑文档</span>
                        </div>
                        <div v-if="item.type == 'file'" class="more-item">
                          <span class="more-icon">
                            <FormOutlined />
                          </span>
                          <span class="more-name" @click="editHandle(item, index)">重命名( √ )</span>
                        </div>
                        <div class="more-item" v-if="item.type == 'file'" @click="downloadFile(item, index)">
                          <span class="more-icon">
                            <DownloadOutlined />
                          </span>
                          <span class="more-name">下载</span>
                        </div>
                        <!-- <div class="more-item">
                          <span class="more-icon">
                            <LinkOutlined />
                          </span>
                          <span class="more-name">复制链接</span>
                        </div> -->
                        <div class="more-line"></div>
                        <!-- <div class="more-item">
                          <span class="more-icon">
                            <LinkOutlined />
                          </span>
                          <span class="more-name">复制文档</span>
                        </div> -->
                        <div class="more-item" @click="moveHandle(item, index)">
                          <span class="more-icon">
                            <ImportOutlined />
                          </span>
                          <span class="more-name">移动( √ )</span>
                        </div>
                        <!-- <div class="more-item" v-if="item.type == 'file'">
                          <div v-if="item.is_favorite == ''" style="display: flex; align-items: center" @click="collectHandleOk(item, index)">
                            <span class="more-icon">
                              <HeartOutlined style="color: #282828" />
                            </span>
                            <span class="more-name">添加收藏( √ )</span>
                          </div>
                          <div v-else style="display: flex; align-items: center" @click="folderDelete(item, index)">
                            <span class="more-icon">
                              <HeartFilled style="color: #1e6fff" />
                            </span>
                            <span class="more-name">取消收藏( √ )</span>
                          </div>
                        </div> -->

                        <div v-if="item.type == 'file'" class="more-item" @click="collectHand(item, index)">
                          <span class="more-icon">
                            <HeartOutlined v-if="!item.is_favorite" />
                            <HeartFilled v-else style="color: #1e6fff" />
                          </span>
                          <span class="more-name"> {{ item.is_favorite ? "取消收藏" : "添加收藏" }}( √ ) </span>
                        </div>
                        <!-- 标签 -->
                        <!-- <div class="more-item">
                          <span class="more-icon">
                            <BookOutlined />
                          </span>
                          <span class="more-name">添加标签</span>
                        </div> -->
                        <div class="more-line"></div>
                        <div class="more-item" @click="settingHandle(item, index)">
                          <span class="more-icon">
                            <SettingOutlined />
                          </span>
                          <span class="more-name">设置( √ )</span>
                        </div>
                        <div class="more-item" @click="showDeleteConfirm(item, index)">
                          <span class="more-icon">
                            <DeleteOutlined />
                          </span>
                          <span class="more-name">删除( √ )</span>
                        </div>
                      </div>
                    </template>
                    <img src="../../assets/file/more.png" height="20px" />
                  </a-popover>
                </div>
              </div>
            </div>
            <div v-else><a-empty></a-empty></div>
          </div>
        </a-spin>
      </div>
      <div class="tree-drop-width-line" style="left: 240px"></div>
      <!-- <div class="knowledge-right" style="width: calc(100% - 240px); height: calc(100vh - 127px); overflow: overlay">
        <div class="file-view-box"></div>
        <Comment></Comment>
      </div> -->
      <!-- 文件详情页 -->
      <div v-if="fileVisible && !backLibrary" style="width: 100%">
        <!-- <fileContent ref="fileContentRef" :id="id"></fileContent> -->
        <!-- <div class="knowledge-right" style="width: calc(100% - 240px); height: calc(100vh - 127px); overflow: overlay"> -->
        <div class="knowledge-right">
          <!-- <div class="file-view-box"></div> -->
          <div class="file-view-box" :class="{ 'fullscreen-mode': isFullscreen }">
            <Tool v-if="isFullscreen" :isFullscreen="isFullscreen" :toggleFullscreen="toggleFullscreen"></Tool>
          </div>
          <!-- <Comment></Comment> -->
        </div>
      </div>
      <!-- 文件夹页 -->
      <div v-else-if="!fileVisible && !backLibrary" style="width: 100%; justify-content: center; display: flex; align-items: center">
        <a-empty>
          <template #description>
            <span> 在左侧目录选择文件进行预览 </span>
          </template>
        </a-empty>
      </div>
      <!-- 文库页 -->
      <div v-else-if="!fileVisible && backLibrary" style="width: 100%">
        <LibraryContent ref="libraryContentRef" :id="id"></LibraryContent>
      </div>
    </div>
    <Editor ref="editorRef" @updateSuccess="handleUpdateSuccess"></Editor>
    <Setting ref="settingRef" :title="settingTitle" @updateSuccess="handleUpdateSuccess"></Setting>

    <TreeSelect ref="treeSelectRef" @selectSuccess="handleSelectSuccess"></TreeSelect>
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
    HeartOutlined,
    HeartFilled,
  } from "@ant-design/icons-vue";
  import { ref, h, onMounted, reactive, watch } from "vue";
  import { useRoute } from "vue-router";
  import Tool from "./model/tool.vue";
  import Comment from "./model/comment.vue";
  import LibraryContent from "./model/libraryContent.vue";
  import fileContent from "./model/fileContent.vue";
  import Setting from "./model/setting.vue";
  import Editor from "./model/editor.vue";
  import { message, Modal } from "ant-design-vue";
  import { postlibraryapi, postcollectapi, postFileapi, postDownloadFile } from "../../api/index.js";
  import qs from "qs";
  import { useAppStore } from "../../store/module/app";

  import TreeSelect from "../library/model/treeSelect.vue";

  import { storeToRefs } from "pinia";

  const treeSelectRef = ref();
  const appStore = useAppStore();

  const settingTitle = ref("");
  const fileContentRef = ref(null);
  const libraryContentRef = ref(null);

  const menuIndex = ref(0);

  // 调用子组件方法
  const callChildMethod = () => {
    if (libraryContentRef.value) {
      libraryContentRef.value.getLibraryImformation(props.id);
    }
  };

  // 添加全屏状态
  const isFullscreen = ref(false);
  const toggleFullscreen = () => {
    isFullscreen.value = !isFullscreen.value;
  };

  // 二级目录数据
  const fileList = ref([]);
  const orderList = ref([
    { id: "time_asc", name: "按时间排序(正序)" },
    { id: "time_desc", name: "按时间排序(倒序)" },
    { id: "name_asc", name: "按文件名排序(a-z)" },
    { id: "name_desc", name: "按文件名排序(z-a)" },
  ]);
  const orderIndex = ref(0);
  const editorRef = ref(null);
  const settingRef = ref(null);
  const popoverVisible = ref([]);
  const userName = ref("");
  const loading = ref(false); // 新增加载状态
  const currentId = ref("");

  // 引入appStore中的属性
  const { selectedKeys, selectedChildren, shouldRefreshLeftTree, breadValue, breadLastId, breadChanges, fileVisible, backLibrary, isFavorite, selectedFileId } = storeToRefs(appStore);
  const route = useRoute();

  // 使用props接收参数
  const props = defineProps({
    id: {
      type: String,
      required: true,
    },
  });
  // 编辑弹窗
  const editHandle = (item, index) => {
    popoverVisible.value[index] = false;
    editorRef.value.showModal(item);
  };
  // 设置弹窗
  const settingHandle = (item, index) => {
    popoverVisible.value[index] = false;
    console.log(item);

    settingTitle.value = item.type == "folder" ? "文件夹" : "文档";
    settingRef.value.showDrawer(item);
  };

  const currentType = ref(""); // 新增类型标识
  // 移动弹窗
  const moveHandle = (item, index) => {
    console.log(item);
    currentId.value = item.id_;
    currentType.value = item.type; // 保存类型（folder/file）
    popoverVisible.value[index] = false;
    treeSelectRef.value.handleVisible("文档移动");
  };
  // 文件下载
  const downloadFile = async (item, index) => {
    popoverVisible.value[index] = false;
    if (item.type === "folder") {
      message.error("文件夹不支持下载");
      return;
    }

    const formData = {
      sf: "1",
      code: item.file_id,
    };
    const response = await postDownloadFile(qs.stringify(formData));

    console.log("接口请求成功:", response);
    if (response.data.result) {
      message.success("操作成功");
      window.location.href = "https://oa.scnjwh.com/luqiao/jxload/view.pdf?code=" + response.data.message; // 触发文件下载
    } else {
      message.error("下载失败");
    }
  };
  // 打开删除提示
  const showDeleteConfirm = (item, index) => {
    popoverVisible.value[index] = false;
    console.log(item);
    Modal.confirm({
      title: "确定删除吗?",
      icon: h(ExclamationCircleOutlined),
      okText: "是",
      okType: "danger",
      cancelText: "否",
      onOk() {
        if (item.type == "folder") {
          folderDeleteHandle(item, index);
        } else {
          deleteHandle(item, index);
        }
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };
  // 删除文件夹
  const folderDeleteHandle = async (item, index) => {
    console.log(item);
    const formData = {
      type: "delete",
      id_: item.id_,
    };
    const response = await postlibraryapi(qs.stringify(formData));

    if (response.data.obj.error == "") {
      message.success("操作成功");
      fetchLibraryTree(selectedChildren.value);
      // 关闭文件详情页
      fileVisible.value = false;
    } else {
      message.error(response.data.obj.error);
    }
  };

  // 删除文件
  const deleteHandle = async (item, index) => {
    console.log(item);

    const formData = {
      type: "delete",
      id_: item.id_,
      classification_id: item.pid,
    };
    const response = await postFileapi(qs.stringify(formData));
    console.log("接口请求成功:", response);
    if (response.data.obj.error == "") {
      message.success(response.data.msg);
      fetchLibraryTree(selectedChildren.value);
      // 更新文库基本信息 KB
      callChildMethod();

      fileVisible.value = false;
    } else {
      message.error(response.data.obj.error);
    }
  };

  // // 添加收藏
  // const collectHandleOk = async (item, index) => {
  //   console.log("item", item);
  //   popoverVisible.value[index] = false;

  //   const formData = {
  //     type: "add",
  //     favorite_id: item.id_,
  //   };
  //   const response = await postcollectapi(qs.stringify(formData));
  //   if (response.data.obj.error == "") {
  //     console.log("接口请求成功:", response);
  //     message.success(response.data.msg);
  //     fetchLibraryTree(item.pid);
  //   } else {
  //     message.error(response.data.obj.error);
  //   }
  // };
  // // 取消收藏
  // const folderDelete = async (item, index) => {
  //   popoverVisible.value[index] = false;
  //   console.log(item);
  //   const formData = {
  //     type: "delete",
  //     id_: item.is_favorite,
  //   };
  //   const response = await postcollectapi(qs.stringify(formData));

  //   if (response.data.obj.error == "取消收藏成功") {
  //     console.log("接口请求成功:", response);
  //     message.success(response.data.msg);
  //     fetchLibraryTree(item.pid);
  //   } else {
  //     message.error(response.data.obj.error);
  //   }
  // };
  const collectHand = (item, index) => {
    popoverVisible.value[index] = false;
    appStore.toggleFavorite(item);
  };
  // 点击下一级
  const fileHandle = (item) => {
    console.log(item);
    backLibrary.value = false;

    if (item.type == "folder") {
      selectedChildren.value = item.id_;
      // 添加面包屑
      appStore.addBread(item.id_, item.name, "/library/" + item.id_);
      // 刷新左侧 文件夹树
      fetchLibraryTree(item.id_);
      // 初始化
      menuIndex.value = 0;
    } else if (item.type == "file") {
      // 文件
      console.log("文件");
      // 提示弹窗
      message.info("文件详情还在开发中！~");
      preview_office(item.file_id, item.name);
      // 显示文件详情
      appStore.fileVisibleTrue();
      // 文件选中  高亮
      menuIndex.value = item.id_;
      // 是否收藏
      isFavorite.value = item.is_favorite;
      // 当前选中 文件id
      selectedFileId.value = item.file_id;
    }
  };

  // 处理子组件editor传来的更新
  const handleUpdateSuccess = (updatedItem) => {
    // const index = fileList.value.findIndex((item) => item.id_ === updatedItem.id_);
    // if (index !== -1) {
    //   fileList.value[index].name = updatedItem.name; // 更新名称
    // }
    // 刷新左侧 文件夹树
    fetchLibraryTree(selectedChildren.value);
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
  const leftLibraryTree = debounce(fetchLibraryTree, 100); // 300ms 防抖

  // 初始化时调用
  onMounted(() => {
    // 优先使用 Pinia 中的 selectedChildren（当前路径）
    console.log(props.id);
    console.log(appStore.selectedChildren);
    const currentPath = props.id || appStore.selectedChildren;
    if (currentPath) {
      fetchLibraryTree(currentPath);
    }
  });
  // 监听路由参数变化
  // 替换原有的route.query.id监听
  watch(
    () => props.id,
    (newId) => {
      fetchLibraryTree(newId);
      menuIndex.value = 0;
    }
  );
  // 监听refreshKey变化
  watch(
    () => appStore.refreshKey,
    () => {
      fetchLibraryTree(selectedChildren.value); // 重新获取当前路由的文件列表
    }
  );
  // 添加文件夹后，刷新第二个左侧树
  watch(shouldRefreshLeftTree, () => {
    // 获取当前点击的路径
    const currentPath = selectedChildren.value;
    if (currentPath) {
      fetchLibraryTree(currentPath); // 精准刷新当前目录
    }
  });
  // 面包屑退回，监听变化，重新获取列表
  watch(breadChanges, () => {
    // 获取当前点击的路径
    fetchLibraryTree(breadLastId.value); // 精准刷新当前目录
  });
  // 收藏
  watch(
    () => appStore.currentFavoriteId,
    (newId) => {
      if (newId) {
        fetchLibraryTree(selectedChildren.value); // 重新加载当前目录
      }
    }
  );

  // 处理子组件 treeSelect 传来的更新
  const handleSelectSuccess = async (selectValue) => {
    // 根据类型选择接口
    const api = currentType.value === "folder" ? postlibraryapi : postFileapi;

    // 获取到移动目标的 pid, 处理逻辑
    const formData = {
      type: "move",
      id_: currentId.value,
    };

    // 文档需要额外参数
    if (currentType.value === "file") {
      formData.classification_id = selectValue; // 文档接口可能需要不同字段名
    } else {
      formData.pid = selectValue;
    }
    console.log("A~~~~~~~~", currentType.value);
    console.log("F~~~~~~~~", formData);

    try {
      const response = await api(qs.stringify(formData));

      if (response.data.code == 1) {
        message.success("移动成功");
        fetchLibraryTree(selectedChildren.value);
        console.log("接口请求成功:", response);
        fileVisible.value = false;
      }
    } catch (error) {
      message.success(response.data.obj.error);
      console.error("接口请求失败:", error);
    }
  };
  // 排序
  const changeOrderList = async (item) => {
    orderIndex.value = item.id;
    const formData = {
      type: "list",
      sort: item.id,
      pid: selectedChildren.value,
    };
    try {
      const response = await postlibraryapi(qs.stringify(formData));

      console.log("接口请求成功:", response);
      if (response.data.code == 1) {
        fileList.value = response.data.obj.data;
        console.log(fileList.value);
      }
    } catch (error) {
      message.success(response.data.obj.error);
      console.error("接口请求失败:", error);
    }
  };
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

  .silder-item-active {
    background: #e6f4ff !important;
    border-radius: 4px;
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

  /* 添加全屏样式 */
  .fullscreen-mode {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    z-index: 9 !important;
    background: white;
    overflow: auto;
  }
</style>
