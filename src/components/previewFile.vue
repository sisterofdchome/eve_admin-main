<template>
  <div style="width: 100%; height: calc(100vh - 137px)">
    <iframe :src="pathUrl" frameborder="0" style="width: 100%; height: 100%"></iframe>
  </div>
</template>
<script setup>
  import { onMounted, watch, toRefs, ref } from "vue";
  import { postDownloadFile } from "../api/index.js";
  import qs from "qs";
  const props = defineProps({
    // 是否显示
    fileName: {
      type: String,
      default: "",
    },
    name: String,
    fileId: {
      type: String,
      default: "",
    },
    isEditMode: {
      type: Boolean,
      default: false,
    },
  });

  onMounted(() => {});

  // 使用 toRefs 保持响应式
  const { fileName, fileId } = toRefs(props);
  const pathUrl = ref("");

  const getPathUrl = async (newName, newId) => {
    const formData = {
      sf: "1",
      code: newId,
    };

    // 只有当是编辑模式时才添加vtype参数
    // formData.vtype = props.isEditMode ? "edit" : "view";
    if (props.isEditMode) {
      formData.vtype = "edit";
    } else {
      formData.vtype = "view";
    }

    // 如果是图片类型直接预览
    if (isImageFile(newName)) {
      // pathUrl.value = `https://example.com/image-preview/${newId}`; // 替换为实际图片预览地址
      // const response = await postDownloadFile(qs.stringify(formData));
      // if (response.data.result) {
      //   pathUrl.value = "https://oa.scnjwh.com/luqiao/jxload/view.pdf?code=" + response.data.message;
      // }
      preview_office(props.fileId, props.fileName);
    } else {
      const response = await postDownloadFile(qs.stringify(formData));
      if (response.data.result) {
        pathUrl.value = response.data.path;
      }
    }
  };

  function isImageFile(newName) {
    if (typeof newName !== "string") return false;
    // 提取扩展名并转为小写
    const extension = newName.split(".").pop().toLowerCase();
    // 常见图片扩展名列表
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"];
    return imageExtensions.includes(extension);
  }

  // 同时监听 fileName 和 fileId 的变化
  // 修改watch监听
  watch(
    [fileName, fileId, () => props.isEditMode], // 新增对isEditMode的监听
    ([newName, newId], newVal) => {
      pathUrl.value = "";
      getPathUrl(newName, newId);
    },
    { immediate: true }
  );
  watch(
    () => props.isEditMode,
    (newVal) => {
      if (newVal) {
        // 当切换为编辑模式时重新获取地址
        getPathUrl(props.fileName, props.fileId);
      }
    }
  );
</script>
