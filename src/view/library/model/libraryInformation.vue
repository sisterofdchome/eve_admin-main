<template>
  <a-drawer title="文库信息" :placement="placement" :closable="false" :visible="visible" @close="onClose" width="300px" class="setting-drawer">
    <div class="know-set-body">
      <!-- <a-descriptions title="" :column="1" :label-style="{ width: '105px', textAlign: 'right' }">
        <a-descriptions-item label="文件数">{{ formState.number_files }}</a-descriptions-item>
        <a-descriptions-item label="创建者">{{ formState.create_name }}</a-descriptions-item>
        <a-descriptions-item label="拥有者">{{ formState.create_name }}</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ formState.create_time }}</a-descriptions-item>
        <a-descriptions-item label="修改时间">{{ formState.update_time }}</a-descriptions-item>
      </a-descriptions> -->
      <div class="know-cover">
        <img alt="example" src="../../../assets/libary/cover.png" style="height: 200px" />
      </div>
      <div class="title">
        {{ formState.classification_name }}
      </div>
      <div class="button-item-box" @click="settinghandle">
        <div class="button-item"><SettingOutlined /><span style="margin-left: 16px">文库设置</span></div>
      </div>
      <div class="more-line"></div>
      <div class="details">
        <div>
          <div class="lable">文件数</div>
          <div class="content">{{ formState.number_files }}</div>
        </div>
        <div>
          <div class="lable">创建者</div>
          <div>{{ formState.create_name }}</div>
        </div>
        <div>
          <div class="lable">拥有者</div>
          <div>{{ formState.create_name }}</div>
        </div>
        <div>
          <div class="lable">创建时间</div>
          <div>{{ formState.create_time }}</div>
        </div>
        <div>
          <div class="lable">修改时间</div>
          <div>{{ formState.update_time }}</div>
        </div>
      </div>
      <div class="more-line"></div>
      <div class="details">
        <div class="flex">
          <div class="lable"><FileZipOutlined style="margin-right: 8px" />文件大小</div>
          <div>{{ formState.size }}KB</div>
        </div>
      </div>
    </div>
  </a-drawer>
  <PersonnelSelection ref="personRef"></PersonnelSelection>

  <Setting ref="settingRef" :title="settingTitle" @updateSuccess="handleUpdateSuccess"></Setting>
</template>

<script setup>
  import PersonnelSelection from "../../../components/personnelSelection.vue";
  import { ref, reactive, watch, onMounted, toRefs } from "vue";
  import { FileZipOutlined, SettingOutlined } from "@ant-design/icons-vue";
  import { message } from "ant-design-vue";
  import { postlibraryapi } from "../../../api/index.js";
  import { useAppStore } from "../../../store/module/app";
  import qs from "qs";

  import Setting from "../model/setting.vue";

  import { storeToRefs } from "pinia";

  const appStore = useAppStore();

  const { selectedKeys, clickLibraryStatus } = storeToRefs(appStore);
  // 接收父组件传递的 props
  const props = defineProps({
    title: {
      type: String, // 类型可以根据需要调整，例如 Number, Object 等
      default: "", // 默认值
    },
  });

  const personRef = ref(null);
  const settingRef = ref(null);
  const settingTitle = ref("文库");

  const formState = reactive({
    classification_name: "",
    number_files: "",
    create_name: "",
    create_time: "",
    update_time: "",
    size: "",
  });

  onMounted(async () => {
    getLibraryImformation();
  });

  const fileList = ref({});
  const getLibraryImformation = async () => {
    const formData = {
      type: "get",
      id_: selectedKeys.value,
    };
    if (selectedKeys.value < 0) return;
    const response = await postlibraryapi(qs.stringify(formData)); // 调用接口
    console.log("接口请求成功:", response);
    if (response.data.obj.error == "") {
      console.log("接口请求成功:", response);
      fileList.value = response.data.obj.data;
      const { classification_name, number_files, create_name, create_time, update_time, size } = response.data.obj.data;
      Object.assign(formState, { classification_name, number_files, create_name, create_time, update_time, size });

      console.log("formStateformState:", formState);
      // message.success(response.data.msg);
    }
  };

  const visible = ref(false);
  const placement = ref("right");

  const settinghandle = () => {
    visible.value = false;
    console.log(fileList.value);
    settingRef.value.showDrawer(fileList.value);
  };
  const onClose = () => {
    visible.value = false;
  };

  const id_ = ref("");
  const showDrawer = (item) => {
    console.log(item);
    visible.value = true;
  };

  // 处理子组件editor传来的更新
  // const handleUpdateSuccess = (updatedItem) => {
  //   const index = fileList.value.findIndex((item) => item.id_ === updatedItem.id_);
  //   if (index !== -1) {
  //     fileList.value[index].name = updatedItem.name; // 更新名称
  //   }
  // };

  // 点击文库设置，刷新
  watch(clickLibraryStatus, () => {
    getLibraryImformation();
  });
  // 定义事件
  const emit = defineEmits(["updateSuccess"]);

  defineExpose({
    showDrawer,
  });
</script>

<style scoped>
  .setting-drawer {
    display: flex;
    height: 100%;
    width: 100%;
  }
  .know-set-body {
    padding: 0 20px;
  }
  /* 强制所有描述项的内容右对齐 */
  :deep(.ant-descriptions-item-content) {
    display: "";
    text-align: right !important;
  }
  .know-cover {
    padding: 8px 0;
    box-sizing: border-box;
    width: 100%;
    height: 144px;
    border-radius: 5px;
    overflow: hidden;
  }
  .know-cover > img {
    width: 100%;
    height: 100%;
    border-radius: 5px;
    object-fit: cover;
  }

  .more-line {
    margin: 16px 0;
    background: #d7d8db;
    height: 1px;
    width: 100%;
  }
  .flex {
    display: flex;
    justify-content: space-between;
  }
  .details > div {
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin: 12px 0;
  }
  .title {
    color: #494f6a;
    font-size: 14px;
    font-family: SourceHanSansCN-Bold !important;
    margin-bottom: 16px;
    margin-top: 10px;
  }
  .lable {
    color: #6f7588;
    font-size: 14px;
  }
  .content {
    color: #363b4c;
    font-size: 14px;
  }
  .button-item-box {
    background: #f5f6f7;
    border-radius: 4px;
    padding: 8px 12px;
    box-sizing: border-box;
    cursor: pointer;
  }
  .button-item {
    display: flex;
    align-items: center;
  }
</style>
