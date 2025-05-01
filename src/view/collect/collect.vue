<template>
  <div style="padding: 0 20px">
    <div class="title">{{ title }}</div>
    <a-table :columns="columns" :data-source="dataSource" bordered :pagination="pagination">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'file_name'">
          <div class="editable-cell" @click="getPathUrl(record)"><img src="../../assets/file/doc.png" height="20px" style="margin-right: 6px" />{{ record.file_name }}</div>
        </template>
        <template v-if="column.dataIndex === 'operation'">
          <div class="editable-row-operations">
            <a-tooltip>
              <template #title>取消收藏</template>
              <span>
                <a @click="recycle(record)"><HeartFilled style="color: red" /></a>
              </span>
            </a-tooltip>
          </div>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script setup>
  import { reactive, ref, onMounted } from "vue";
  import { HeartFilled } from "@ant-design/icons-vue";

  import { useRoute } from "vue-router";

  import { postcollectapi, postDownloadFile } from "../../api/index";
  import qs from "qs";
  import { message } from "ant-design-vue";

  const route = useRoute();
  const title = ref(route.query.title);
  const columns = [
    {
      title: "文件名称",
      dataIndex: "file_name",
      width: "55%",
    },
    {
      title: "归属",
      dataIndex: "user_name",
      width: "15%",
    },
    {
      title: "修改时间",
      dataIndex: "create_time",
      width: "20%",
    },
    {
      title: "操作栏",
      dataIndex: "operation",
      align: "center",
    },
  ];
  const dataSource = ref([]);
  // 新增分页配置
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showTotal: (total) => `共 ${total} 条`,
    onChange: (page, pageSize) => {
      pagination.current = page;
      pagination.pageSize = pageSize;
      fetchCollectData();
    },
  });
  // 修改请求参数
  const formData = reactive({
    type: "page",
    pageNum: 1,
    pageSize: 10,
  });

  onMounted(() => {
    fetchCollectData();
  });
  const fetchCollectData = async () => {
    // 更新分页参数
    formData.pageNum = pagination.current;
    formData.pageSize = pagination.pageSize;
    try {
      const response = await postcollectapi(qs.stringify(formData));

      if (response.data.obj.error == "") {
        console.log("接口请求成功:", response);
        dataSource.value = response.data.obj.data.data; // 保存原始数据
        // 更新总记录数
        pagination.total = response.data.obj.data.count;
      }
    } catch (error) {
      console.error("接口请求失败:", error);
    }
  };

  const recycle = async (record) => {
    console.log("key", record);
    try {
      const Data = {
        type: "delete",
        id_: record.id_,
      };
      const response = await postcollectapi(qs.stringify(Data));

      if (response.data.obj.error == "取消收藏成功") {
        console.log("接口请求成功:", response);
        message.success("收藏取消成功");
        // 更新
        fetchCollectData();
      }
    } catch (error) {
      message.success("收藏取消失败");
      console.error("接口请求失败:", error);
    }
  };
  const pathUrl = ref("");

  const getPathUrl = async (record) => {
    const newName = record.file_name;
    const newId = record.file_id;
    const formData = {
      sf: "1",
      code: newId,
      vtype: "view",
    };

    // 如果是图片类型直接预览
    if (isImageFile(newName)) {
      // pathUrl.value = `https://example.com/image-preview/${newId}`; // 替换为实际图片预览地址
      // const response = await postDownloadFile(qs.stringify(formData));
      // if (response.data.result) {
      //   pathUrl.value = "https://oa.scnjwh.com/luqiao/jxload/view.pdf?code=" + response.data.message;
      // }
      preview_office(newId, newName);
    } else {
      // const response = await postDownloadFile(qs.stringify(formData));
      // if (response.data.result) {
      //   pathUrl.value = response.data.path;
      // }
      edit_office(newId, newName);
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
  const cancel = (key) => {};
</script>
<style scoped>
  .editable-cell {
    align-items: center;
    display: flex;
    color: #1677ff;
    cursor: pointer;
  }
  .editable-row-operations a {
    /* margin-right: 8px; */
  }

  .title {
    margin: 14px 0;
    font-size: 20px;
    font-family: SourceHanSansCN-Bold !important;
    color: #363b4c;
    font-weight: bold;
  }
</style>
