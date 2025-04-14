<template>
  <a-popover v-model:visible="popoverVisible" trigger="click" placement="bottomLeft" overlayClassName="add-type-file">
    <template #title>
      <div class="add-type-box">
        <div class="add-type-title">通用文档</div>
        <div class="type-lists">
          <svg-icon name="xz" width="20px" height="20px"></svg-icon>
          <div class="type-item"></div>
        </div>
        <div class="add-type-title">office套件</div>
        <div class="type-lists">
          <div class="type-item">
            <img src="../assets/libary/word.png" class="type-icon" />
            <div class="type-name">Word</div>
          </div>
          <div class="type-item">
            <img src="../assets/libary/xlsx.png" class="type-icon" />
            <div class="type-name">Excel</div>
          </div>
          <div class="type-item">
            <img src="../assets/libary/ppt.png" class="type-icon" />
            <div class="type-name">PPT</div>
          </div>
          <div class="type-item">
            <img src="../assets/libary/csv.png" class="type-icon" />
            <div class="type-name">CSV</div>
          </div>
        </div>
        <div class="add-type-title">更多</div>
        <div class="type-lists">
          <div class="type-item" @click="handleLibraryClick('wk')">
            <img src="../assets/libary/libary.png" class="type-icon" />
            <div class="type-name">文库</div>
          </div>
          <div class="type-item" @click="handleFloderClick('wj')">
            <img src="../assets/libary/folder.png" class="type-icon" />
            <div class="type-name">新建文件夹</div>
          </div>
        </div>
      </div>
    </template>
    <a-button type="primary" style="margin-left: 15px"
      ><template #icon> <PlusOutlined /> </template>新建</a-button
    >
  </a-popover>

  <a-button style="margin-left: 15px" @click="uploadVisible = true"
    ><template #icon> <DownloadOutlined /> </template>导入</a-button
  >
  <!-- 新建文库 弹窗 -->
  <a-modal v-model:visible="libraryVisible" :title="'新建' + title" @ok="libraryHandleOk()">
    <h1>{{ selectFolderOrLibrary }}</h1>
    <h1>{{ "选中的value" + value }}</h1>
    <a-form ref="libraryformRef" :model="LibraryForm" name="basic" :label-col="{ span: 5 }" autocomplete="off" style="padding-top: 20px">
      <a-form-item :label="title + '名称'" name="libraryName" :rules="[{ required: true, message: '请填写名称' }]">
        <a-input v-model:value="LibraryForm.libraryName" :placeholder="'请输入' + title" />
      </a-form-item>
      <a-form-item :label="title + '描述'" name="libraryContent">
        <a-textarea v-model:value="LibraryForm.libraryContent" :placeholder="'请输入' + title + '描述'" :Rows="4" />
      </a-form-item>
    </a-form>
  </a-modal>
  <!-- 导入上传文件 弹窗 -->
  <a-modal v-model:visible="uploadVisible" title="上传文件" @ok="uploadHandleOk()">
    <CustomUpload name="attachment" :value="fileList" @display="handleDisplay"></CustomUpload>
  </a-modal>
  <TreeSelect ref="treeSelectRef" @selectSuccess="handleSelectSuccess"></TreeSelect>
</template>

<script setup lang="js">
  import { reactive, ref, toRaw } from "vue";
  import qs from "qs";
  import { message } from "ant-design-vue";
  import { onMounted, watch } from "vue";
  import { useAppStore } from "../store/module/app";

  import CustomUpload from "../components/customUpload.vue";
  import TreeSelect from "../view/library/model/treeSelect.vue";
  import { PlusOutlined, DownloadOutlined } from "@ant-design/icons-vue";
  import { postlibraryapi } from "../api/index";
  import { storeToRefs } from "pinia";

  const appStore = useAppStore();
  const popoverVisible = ref(false);
  const libraryVisible = ref(false);
  const libraryformRef = ref();
  const title = ref("");
  const treeSelectRef = ref();

  const fileList = ref([]);
  const uploadVisible = ref(false);
  const selectFolderOrLibrary = ref("");

  // 引入appStore中的属性
  const { selectedKeys } = storeToRefs(appStore);

  // 接收父组件传递的 props
  const props = defineProps({
    value: {
      type: String, // 类型可以根据需要调整，例如 Number, Object 等
      default: "", // 默认值
    },
  });

  const LibraryForm = reactive({
    libraryName: "",
    libraryContent: "",
  });
  const uploadHandleOk = () => {
    console.log(fileList.value);
    console.log(props.value);
  };

  const handleLibraryClick = () => {
    popoverVisible.value = false; // 关闭popover
    title.value = "文库";
    libraryVisible.value = true;
  };
  const handleFloderClick = (type) => {
    popoverVisible.value = false; // 关闭popover
    title.value = "文件夹";
    if (selectedKeys.value > "0") {
      libraryVisible.value = true; // 如果大于 0 ，直接显示新建文件夹模态框

      appStore.triggerRefresh(); // 触发全局刷新
    } else {
      treeSelectRef.value.handleVisible(type);
    }
  };

  // const handleLibraryClick = (type) => {
  //   popoverVisible.value = false; // 关闭popover
  // if (type == "wj") {
  //   title.value = "文件夹";
  //   if (props.value > 0) {
  //     treeSelectRef.value.handleVisible(type);
  //   } else {
  //     libraryVisible.value = true; // 如果有 value，直接显示新建文件夹模态框
  //   }
  // } else if (type == "wk") {
  //   title.value = "文库";
  //   libraryVisible.value = true;
  // }
  //   if (selectedKeys.value > "0") {
  //     libraryVisible.value = true; // 如果大于 0 ，直接显示新建文件夹模态框
  //   } else {
  //     treeSelectRef.value.handleVisible(type);
  //   }
  // };
  /**
   * @description: 新建文库
   * @param {*}
   * @return {*}
   */
  const libraryHandleOk = () => {
    libraryformRef.value
      .validateFields()
      .then(async (values) => {
        console.log("LibraryForm: ", toRaw(LibraryForm));
        const fatherId = props.value || selectFolderOrLibrary.value;
        const formData = {
          type: "add",
          classification_name: LibraryForm.libraryName,
          description: LibraryForm.libraryContent,
          pid: fatherId,
        };
        if (title.value == "文库") {
          formData.pid = "";
        }

        const response = await postlibraryapi(qs.stringify(formData)); // 调用接口
        console.log("接口请求成功:", response);

        if (response.data.code == 1) {
          message.success(response.data.msg);
          // 触发事件，传递更新后的数据
          emit("updateSuccess");
          appStore.triggerRefresh(); // 触发全局刷新
          libraryformRef.value.resetFields();
          libraryVisible.value = false;

          title.value = "";
        } else {
          message.error("更新失败");
        }
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const handleDisplay = (data) => {
    console.log("handleDisplay", data);
    fileList.value = data.value ? JSON.parse(data.value) : [];
  };

  // 更新 主组件文库列表 事件
  const emit = defineEmits(["updateSuccess"]);

  // 处理子组件 treeSelect 传来的更新
  const handleSelectSuccess = (selectValue) => {
    libraryVisible.value = true;
    selectFolderOrLibrary.value = selectValue; // 更新名称
  };
</script>

<style>
  .add-type-box {
    padding: 24px 0;
    box-sizing: border-box;
  }

  .add-type-box .add-type-title:nth-of-type(1) {
    margin-top: 0;
  }

  .add-type-box .add-type-title {
    font-size: 17px;
    color: #363b4c;
    font-family: SourceHanSansCN-Bold !important;
    margin-bottom: 12px;
    padding: 0 20px;
    margin-top: 24px;
    box-sizing: border-box;
  }

  .add-type-box .type-lists {
    display: flex;
    flex-wrap: wrap;
    grid-column-gap: 6px;
    grid-row-gap: 12px;
    padding: 0 20px;
  }

  .add-type-box .type-lists .type-item {
    cursor: pointer;
    border-radius: 6px;
    width: 76px;
    height: 76px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }

  .add-type-box .type-lists .type-item .type-name {
    font-size: 14px;
    color: #363b4c;
    font-family: SourceHanSansCN-Regular;
    margin-top: 4px;
  }

  .add-type-box .type-lists .type-item .type-icon {
    width: 36px;
    min-width: 36px;
    height: 36px;
    min-height: 36px;
  }
</style>
