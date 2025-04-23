<template>
  <a-modal :visible="visible" :title="title" @ok="libraryHandleOk()" @cancel="visible = false" width="600px">
    <a-form ref="libraryformRef" :model="LibraryForm" name="basic" :label-col="{ span: 4 }" autocomplete="off" @finish="onFinish" @finishFailed="onFinishFailed">
      <a-form-item :label="label" name="libraryName" :rules="[{ required: true, message: '请填写名称' }]">
        <a-input v-model:value="LibraryForm.libraryName" :placeholder="'请输入' + label" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="js" setup>
  import { reactive, ref, toRaw } from "vue";

  import { message } from "ant-design-vue";
  import { postFileapi, postlibraryapi } from "../../../api/index.js";
  import qs from "qs";

  const visible = ref(false);
  const libraryformRef = ref();
  const title = ref("");
  const label = ref("");
  const LibraryForm = reactive({
    libraryName: "",
    id_: "",
  });
  // 定义事件
  const emit = defineEmits(["updateSuccess"]);
  const showModal = (item) => {
    // 打开弹窗
    visible.value = true;
    // 设置表单数据
    LibraryForm.id_ = item.id_;
    LibraryForm.libraryName = item.name;
    console.log("item: ", item);
    title.value = item.type == "folder" ? "修改文件夹" : "修改文件";
    label.value = item.type == "folder" ? "文件夹名称" : "文件名称";
  };

  const libraryHandleOk = () => {
    libraryformRef.value
      .validateFields()
      .then(async (values) => {
        console.log("LibraryForm: ", toRaw(LibraryForm));

        const formData = {
          type: "update",
          id_: LibraryForm.id_,
        };
        let response;
        if (title.value == "修改文件夹") {
          formData.classification_name = LibraryForm.libraryName;
          // 文件夹更新名称
          response = await postlibraryapi(qs.stringify(formData));
        } else {
          formData.file_name = LibraryForm.libraryName;
          // 文档更新名称
          response = await postFileapi(qs.stringify(formData)); // 调用接口
        }
        console.log("接口请求成功:", response);
        if (response.data.code == 1) {
          message.success(response.data.msg);
          // 触发事件，传递更新后的数据
          emit("updateSuccess", {
            id_: LibraryForm.id_,
            name: LibraryForm.libraryName,
          });
          libraryformRef.value.resetFields();
          visible.value = false;
        } else {
          message.error("更新失败");
        }
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  defineExpose({
    showModal,
  });
</script>
