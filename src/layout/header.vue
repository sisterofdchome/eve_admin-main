<template>
  <a-popover v-model:visible="popoverVisible" trigger="click" placement="bottomLeft" overlayClassName="add-type-file">
    <template #title>
      <div class="add-type-box">
        <!-- <div class="add-type-title">通用文档</div>
        <div class="type-lists">
          <div class="type-item">
            <img src="../assets/libary/word.png" class="type-icon" />
            <div class="type-name">Word</div>
          </div>
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
        </div> -->
        <div class="add-type-title">新建</div>
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

  <a-button style="margin-left: 15px" @click="handleUploadClick('upload')"
    ><template #icon> <UploadOutlined /></template>上传文件</a-button
  >
  <!-- 新建文库 弹窗 -->
  <a-modal v-model:visible="libraryVisible" :title="'新建' + title" @ok="libraryHandleOk()">
    <!-- <h1>{{ selectFolderOrLibrary }}</h1>
    <h1>{{ "选中的value" + value }}</h1> -->
    <div class="cover-box">
      <div class="cover-show"><img :src="selectedCover" /><!----></div>
      <div class="select-cover-box">
        <div class="type-box">
          <div class="el-scrollbar">
            <div class="el-scrollbar__wrap el-scrollbar__wrap--hidden-default">
              <div class="el-scrollbar__view" style="">
                <div class="type-items">
                  <div class="type-item" v-for="(item, index) in imgList" :class="{ active: activeType === index }" @click="handleTypeClick(index)">{{ item.type }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="img-box">
          <div class="el-scrollbar">
            <div class="el-scrollbar__wrap el-scrollbar__wrap--hidden-default">
              <div class="el-scrollbar__view" style="">
                <div class="img-item" v-for="item in imgList[activeType].children" @click="handleCoverClick(item)">
                  <img :src="item"  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
    <CustomUpload name="attachment" :value="fileList" @display="handleDisplay" :key="index"></CustomUpload>
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
  import { PlusOutlined, DownloadOutlined, UploadOutlined } from "@ant-design/icons-vue";
  import { postlibraryapi, postFileapi } from "../api/index";
  import { storeToRefs } from "pinia";

  import a1 from "@/assets/cover/a1.png";
  import a2 from "@/assets/cover/a2.png";
  import b1 from "@/assets/cover/b1.png";
  import b2 from "@/assets/cover/b2.png";
  const imgList = reactive([
    {
      img: a1,
      type: "全部",
      children: [a1, a2, b1, b2],
    },
    // {
    //   img: b2,
    //   type: "a类",
    //   children: [a1, a2],
    // },
    // {
    //   img: "@/assets/cover/a1.png",
    //   type: "b类",
    //   children: [b1, b2],
    // },
  ]);

  const appStore = useAppStore();
  const popoverVisible = ref(false);
  const libraryVisible = ref(false);
  const libraryformRef = ref();
  const title = ref("");
  const treeSelectRef = ref();

  const fileList = ref([]);
  const index = ref(0);
  const uploadVisible = ref(false);

  // 引入appStore中的属性
  const { selectedKeys, selectedChildren, breadValue } = storeToRefs(appStore);
  const selectFolderOrLibrary = ref(selectedChildren.value);

  // 接收父组件传递的 props
  const props = defineProps({
    value: {
      type: String, // 类型可以根据需要调整，例如 Number, Object 等
      default: "", // 默认值
    },
  });

  const LibraryForm = reactive({
    libraryCover: "",
    libraryName: "",
    libraryContent: "",
  });
  // 上传文件
  const uploadHandleOk = async () => {
    console.log(fileList.value);
    console.log(selectFolderOrLibrary.value);
    try {
      // 循环处理 fileList 中的每个文件
      for (const file of fileList.value) {
        const Data = {
          type: "add",
          file_name: file.name, // 使用当前文件的 name
          file_id: file.id, // 使用当前文件的 id
          file_size: file.size,
          classification_id: selectFolderOrLibrary.value,
        };
        // 发送请求（注意 await 确保顺序执行）
        const response = await postFileapi(qs.stringify(Data));
        if (response.data.code === 1) {
          console.log(`文件 ${file.name} 请求成功:`, response);
        } else {
          console.error(`文件 ${file.name} 请求失败:`, response.data.message);
          message.error(`文件 ${file.name} 操作失败`);
        }
        fileList.value = [];
        // console.log("fileList", fileList.value);
        index.value++;
      }
      // 所有文件处理完成后提示
      message.success("操作完成");
      appStore.triggerLeftTreeRefresh();
      uploadVisible.value = false;
    } catch (error) {
      message.error("操作失败");
      console.error("接口请求异常:", error);
    }
  };

  // 新建文库
  const handleLibraryClick = () => {
    popoverVisible.value = false; // 关闭popover
    title.value = "文库";
    libraryVisible.value = true;
  };
  // 新建文件夹
  const handleFloderClick = (type) => {
    popoverVisible.value = false; // 关闭popover
    title.value = "文件夹";
    if (selectedChildren.value > "0") {
      libraryVisible.value = true; // 如果大于 0 ，直接显示新建文件夹模态框
    } else {
      treeSelectRef.value.handleVisible(type);
    }
  };
  // 文件上传
  const handleUploadClick = (type) => {
    popoverVisible.value = false; // 关闭popover

    title.value = "文件上传";
    if (selectedChildren.value > "0") {
      uploadVisible.value = true; // 如果大于 0 ，直接弹出上传文件 弹窗
    } else {
      treeSelectRef.value.handleVisible(type);
    }
  };

  const activeType = ref(0);
  const selectedCover = ref(a1);
  // 初始化选择的封面
  LibraryForm.libraryCover= a1

  const handleTypeClick = (type) => {
    activeType.value = type;
  };

  const handleCoverClick = (cover) => {
    selectedCover.value = cover;
    LibraryForm.libraryCover= cover
    console.log(cover);
  };
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
        const fatherId = selectFolderOrLibrary.value;
        const formData = {
          type: "add",
          classification_name: LibraryForm.libraryName,
          description: LibraryForm.libraryContent,
          folder_cover:  LibraryForm.libraryCover,
          pid: fatherId,
        };
        if (title.value == "文库") {
          formData.pid = "";
        }

        const response = await postlibraryapi(qs.stringify(formData)); // 调用接口
        if (response.data.obj.error == "") {
          console.log("接口请求成功:", response);
          // 子目录选中项
          // selectedChildren.value = response.data.obj.data;
          if (title.value == "文库") {
            selectedKeys.value = response.data.obj.data;
            selectedChildren.value = response.data.obj.data;
            // 更新面包屑
            // breadValue.value[0] = { id: 0, name: first, url: `/allLibrary/${first}` };
            breadValue.value[1] = { id: selectedKeys.value, name: response.data.obj.classification_name, url: "/library/" + selectedKeys.value };
          }
          message.success(response.data.msg);
          // 触发事件，传递更新后的数据
          emit("updateSuccess", selectedKeys.value, title.value);

          appStore.triggerLeftTreeRefresh(); // 只触发左侧树刷新
          libraryformRef.value.resetFields();
          libraryVisible.value = false;

          response.data.obj.id;
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
    if (title.value == "文件导入") {
      uploadVisible.value = true;
    } else libraryVisible.value = true;
    selectFolderOrLibrary.value = selectValue; // 获取到移动目标的 pid, 处理逻辑
  };

  watch(
    () => appStore.selectedChildren,
    () => {
      selectFolderOrLibrary.value = appStore.selectedChildren;
    }
  );
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
  .add-type-box .type-lists {
    display: flex;
    flex-wrap: wrap;
    grid-column-gap: 6px;
    grid-row-gap: 12px;
    padding: 0 20px;
  }
  .add-type-box {
    padding: 24px 0;
    box-sizing: border-box;
  }
  .el-scrollbar {
    overflow: hidden;
    position: relative;
    height: 100%;
  }
  .add-type-box .type-lists .type-item:hover {
    background: #f5f6f7;
  }

  .cover-box {
    display: flex;
  }
  .cover-box .cover-show {
    width: 152px;
    height: 152px;
    overflow: hidden;
    border-radius: 6px;
    position: relative;
  }
  .cover-box .cover-show img {
    width: 152px;
    height: 152px;
  }
  .cover-box .select-cover-box {
    margin-left: 8px;
    width: calc(100% - 160px);
  }
  .cover-box .select-cover-box .type-box {
    display: flex;
    align-items: center;
    height: 32px;
  }
  .el-scrollbar {
    overflow: hidden;
    position: relative;
    height: 100%;
  }
  .cover-box .select-cover-box .type-box .line {
    height: 24px;
    width: 1px;
    background-color: #d7d8db;
    margin-bottom: 8px;
  }
  .cover-box .select-cover-box .type-box .upload-box {
    height: 24px;
    margin-bottom: 4px;
    display: flex;
    width: 48px;
    color: #1e6fff;
    font-size: 12px;
  }
  .cover-box .select-cover-box .img-box {
    height: 120px;
  }
  .cover-box .select-cover-box .type-box .type-items {
    display: flex;
    align-items: center;
    width: calc(100% + -0px);
    box-sizing: border-box;
    font-size: 12px;
    word-break: keep-all;
  }
  .cover-box .select-cover-box .type-box .type-items .type-item {
    padding: 0 8px;
    height: 24px;
    line-height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 4px;
    font-family: SourceHanSansCN-Regular;
    margin-right: 4px;
  }
  .cover-box .select-cover-box .type-box .type-items .type-item:hover,
  .cover-box .select-cover-box .type-box .type-items .active {
    background: #e4edff;
    color: #1e6fff;
  }

  .el-scrollbar__wrap--hidden-default {
    scrollbar-width: none;
  }
  .el-scrollbar__wrap {
    overflow: auto;
    height: 100%;
  }
  .cover-box .select-cover-box .img-box .el-scrollbar__view {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    flex-wrap: wrap;
    grid-column-gap: 8px;
    grid-row-gap: 8px;
    padding-right: 8px;
  }

  .cover-box .select-cover-box .img-box .img-item {
    height: 56px;
    width: 56px;
    cursor: pointer;
    border: 1px solid transparent;
    border-radius: 6px;
    overflow: hidden;
  }
  .cover-box .select-cover-box .img-box .active {
    border-color: #1e6fff;
  }
  .cover-box .select-cover-box .img-box .img-item img {
    height: 56px;
    width: 56px;
  }
</style>
