<template>
  <a-modal :visible="visible" @ok="libraryHandleOk()" @cancel="visible = false" width="600px">
    <template #title>
      <div class="custom-title">
        <div class="main-title">{{ title }}</div>
        <div class="sub-title">请先选择一个文库或文件夹</div>
      </div>
    </template>
    <a-spin :spinning="loading">
      <a-input-search v-model:value="searchKeyword" placeholder="请输入文库名称进行搜索" @search="handleSearch" allowClear style="margin-bottom: 12px" />
      <a-tree
        :tree-data="filteredTreeData"
        :expanded-keys="expandedKeys"
        :selected-keys="selectedKey"
        :field-names="fieldNames"
        block-node
        show-icon
        v-model:expandedKeys="expandedKeys"
        @expand="handleExpand"
        @select="handleSelect"
      >
        <template #icon="{ type }">
          <FolderOutlined v-if="type === 'folder'" />
        </template>

        <!-- 自定义节点标题，添加高亮效果 -->
        <template #title="{ name }">
          <span v-html="highlightText(name)"></span>
        </template>
      </a-tree>
      <!-- // 添加无结果提示 -->
      <a-empty v-if="!filteredTreeData.length" description="未找到匹配结果" />
    </a-spin>
  </a-modal>
</template>

<script lang="js" setup>
  import { reactive, ref, toRaw, watch } from "vue";
  import { onMounted, computed } from "vue";
  import { FolderOutlined } from "@ant-design/icons-vue";
  import { postlibraryapi } from "../../../api/index.js";
  import qs from "qs";

  import { useAppStore } from "../../../store/module/app";

  const appStore = useAppStore();

  const visible = ref(false);
  const title = ref("");

  const loading = ref(false); // 新增加载状态
  // 字段映射配置
  const fieldNames = {
    title: "name",
    key: "value",
    children: "children",
  };

  const selectedKey = ref([]);

  let searchTimer = null;
  // 树数据相关
  const searchKeyword = ref("");
  const expandedKeys = ref([]);
  const filteredTreeData = ref([]);
  const originalTreeData = ref([]); // 保存原始数据

  // 处理展开事件
  const handleExpand = (keys) => {
    expandedKeys.value = keys;
  };

  // 初始化时调用
  onMounted(() => {
    fetchLibraryTree();
  });
  const fetchLibraryTree = async () => {
    loading.value = true; // 开始加载
    const formData = {
      type: "treeOnlyFolder",
    };
    try {
      const response = await postlibraryapi(qs.stringify(formData));
      console.log("接口请求成功:", response);
      if (response.data.code == 1) {
        originalTreeData.value = response.data.obj.data; // 保存原始数据
        filteredTreeData.value = originalTreeData.value; // 初始化显示全部
      }
    } catch (error) {
      console.error("接口请求失败:", error);
    } finally {
      loading.value = false; // 加载完成
    }
  };

  // 搜索处理
  const handleSearch = () => {
    if (!searchKeyword.value) {
      filteredTreeData.value = originalTreeData.value;
      expandedKeys.value = [...new Set([...expandedKeys.value, ...Array.from(matches)])];
      return;
    }

    const keyword = searchKeyword.value.toLowerCase();
    const matches = new Set(); // 存储匹配节点的父级key

    // 递归过滤树节点
    const filterNodes = (nodes) => {
      return nodes
        .filter((node) => {
          let hasMatch = false;

          // 检查子节点
          if (node.children) {
            const children = filterNodes(node.children);
            if (children.length) {
              node.children = children;
              hasMatch = true;
              matches.add(node.value); // 将父节点加入展开列表
            }
          }

          // 检查当前节点是否匹配
          const isMatch = node.name.toLowerCase().includes(keyword);
          if (isMatch) {
            // 向上收集所有父节点
            let parent = node.parent;
            while (parent) {
              matches.add(parent.value);
              parent = parent.parent;
            }
          }

          return isMatch || hasMatch;
        })
        .map((node) => ({
          ...node,
          // 保留原始子节点结构
          children: node.children ? [...node.children] : null,
        }));
    };

    filteredTreeData.value = filterNodes(JSON.parse(JSON.stringify(originalTreeData.value)));
    expandedKeys.value = Array.from(matches);
  };

  // 高亮匹配文本
  const highlightText = (text) => {
    if (!searchKeyword.value) return text;
    const regex = new RegExp(`(${searchKeyword.value})`, "gi");
    return text.replace(regex, '<span style="color: #1890ff; font-weight: 500; background: #fff1f0">$1</span>');
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
    fetchLibraryTree();
    if (type == "wj") {
      title.value = "新建文件夹";
    } else if (type == "文档移动") {
      title.value = type; // 如果是文库，则显示新建文库模态框
    } else if (type == "recycle") {
      title.value = "恢复文件";
    } else if (type == "upload") {
      title.value = "文件导入";
    }
  };

  // 监听refreshKey变化
  watch(
    () => appStore.refreshKey,
    () => {
      fetchLibraryTree(); // 重新获取当前路由的文件列表
    }
  );

  const libraryHandleOk = () => {
    // 触发事件，传递更新后的数据
    emit("selectSuccess", selectedKey.value[0]);
    visible.value = false;
    selectedKey.value = [];
  };
  // 防抖处理
  watch(searchKeyword, (newVal) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(handleSearch, 300);
  });

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
  .sub-title {
    font-size: 12px;
    color: #6f7588;
    font-family: SourceHanSansCN-Regular;
  }
</style>
