<template>
  <a-modal :visible="visible" :title="title" @ok="libraryHandleOk()" @cancel="visible = false" width="600px">
    <a-spin :spinning="loading" tip="加载中...">
      <div class="container">
        <a-input-search v-model:value="searchKeyword" placeholder="请输入文库名称进行搜索" style="margin-bottom: 12px" />

        <a-tree v-model:selectedKeys="selectedKey" :tree-data="processedTreeData" :fieldNames="fieldNames" :filterTreeNode="filterTreeNode" show-icon blockNode @select="handleSelect">
          <template #icon="{ type }">
            <FolderOutlined v-if="type === 'folder'" />
          </template>
        </a-tree>
      </div>
    </a-spin>
  </a-modal>
</template>

<script lang="js" setup>
  import { reactive, ref, toRaw } from "vue";
  import { onMounted, computed } from "vue";
  import { FolderOutlined } from "@ant-design/icons-vue";
  import { postlibraryapi } from "../../../api/index.js";
  import qs from "qs";

  const visible = ref(false);
  const title = ref("");
  const fileList = ref([]);

  const loading = ref(false); // 新增加载状态
  // 字段映射配置
  const fieldNames = {
    title: "name",
    key: "value",
    children: "children",
  };

  const searchKeyword = ref("");
  const selectedKey = ref([]);

  // 初始化时调用
  onMounted(() => {
    fetchLibraryTree();
  });
  const fetchLibraryTree = async () => {
    loading.value = true; // 开始加载
    fileList.value = [];
    const formData = {
      type: "tree",
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

  // 处理后的树数据（添加类型标识）
  const processedTreeData = computed(() => {
    const addType = (nodes) =>
      nodes.map((node) => ({
        ...node,
        type: node.type || "folder",
        children: node.children ? addType(node.children) : undefined,
      }));
    return addType(fileList.value);
  });

  // 树节点过滤方法
  const filterTreeNode = (node) => {
    return node.name.toLowerCase().includes(searchKeyword.value.toLowerCase());
  };

  // 单选处理
  const handleSelect = (selectedKeys, { node }) => {
    if (selectedKeys.length && selectedKeys[0] === node.value) {
      selectedKey.value = [node.value];
    } else {
      selectedKey.value = [];
    }
    console.log(selectedKey.value);
  };

  // 定义事件
  const emit = defineEmits(["selectSuccess"]);
  const handleVisible = (type) => {
    visible.value = true;
    if (type == "wj") {
      title.value = "新建文件夹";
    }
  };

  const libraryHandleOk = () => {
    // 触发事件，传递更新后的数据
    emit("selectSuccess", selectedKey.value[0]);
    visible.value = false;
    selectedKey.value = [];
  };

  defineExpose({
    handleVisible,
  });
</script>
<style scoped>
  .container {
    max-width: 100%;
    padding: 20px;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
  }
  :deep(.ant-tree-node-content-wrapper) {
    width: 100%;
  }
</style>
