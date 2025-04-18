<template>
  <div style="padding: 0 20px">
    <div class="title">{{ title }}</div>
    <a-table :columns="columns" :data-source="dataSource" bordered :pagination="pagination">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'name'">
          <div class="editable-cell"><img src="../../assets/file/doc.png" height="20px" />{{ record.name }}</div>
        </template>
        <!-- <template v-if="column.dataIndex === 'deleted_time'">
          <div class="editable-cell">
            {{
              dayjs(
                `${record.deleted_time.year}-${String(record.deleted_time.monthValue).padStart(2, "0")}-${String(record.deleted_time.dayOfMonth).padStart(2, "0")}T${String(record.deleted_time.hour).padStart(2, "0")}:${String(record.deleted_time.minute).padStart(2, "0")}:${String(record.deleted_time.second).padStart(2, "0")}`
              ).format("YYYY-MM-DD HH:mm:ss")
            }}
          </div>
        </template> -->
        <template v-if="column.dataIndex === 'operation'">
          <div class="editable-row-operations">
            <span>
              <a-tooltip>
                <template #title>恢复文件</template>
                <a-popconfirm title="确定恢复文件吗?" @confirm="recycleTree(record)">
                  <a><sync-outlined /></a>
                </a-popconfirm>
              </a-tooltip>
              <a-tooltip>
                <template #title>彻底删除</template>
                <a-popconfirm title="确定删除吗?" @confirm="realDelete(record)">
                  <a><DeleteOutlined /></a>
                </a-popconfirm>
              </a-tooltip>
            </span>
          </div>
        </template>
      </template>
    </a-table>
    <TreeSelect ref="treeSelectRef" @selectSuccess="handleSelectSuccess"></TreeSelect>
  </div>
</template>
<script setup>
  import { reactive, ref, onMounted } from "vue";
  import { FileTextTwoTone, SyncOutlined, DeleteOutlined } from "@ant-design/icons-vue";

  import { useRoute } from "vue-router";
  import dayjs from "dayjs";

  import { postFileapi } from "../../api/index";

  import TreeSelect from "../../view/library/model/treeSelect.vue";
  import qs from "qs";

  import { message } from "ant-design-vue";

  const treeSelectRef = ref();
  // 选择的目标文件夹
  const selectFolderOrLibrary = ref("");
  // 当前操作的record 文件id
  const selectFileId = ref("");

  const route = useRoute();
  const title = ref(route.query.title);
  const columns = [
    {
      title: "文件名称",
      dataIndex: "file_name",
      width: "55%",
    },
    {
      title: "操作人",
      dataIndex: "deleted_name",
      width: "15%",
    },
    {
      title: "删除时间",
      dataIndex: "deleted_time",
      width: "20%",
    },
    {
      title: "操作栏",
      dataIndex: "operation",
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
      fetchRecycleData();
    },
  });
  // 修改请求参数
  const formData = reactive({
    type: "recycleBin",
    pageNum: 1,
    pageSize: 10,
  });

  onMounted(() => {
    fetchRecycleData();
  });
  const fetchRecycleData = async () => {
    // 更新分页参数
    formData.pageNum = pagination.current;
    formData.pageSize = pagination.pageSize;
    try {
      const response = await postFileapi(qs.stringify(formData));

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

  const recycleTree = async (record) => {
    selectFileId.value = record.id_;
    treeSelectRef.value.handleVisible("recycle");
  };
  const recycleDemo = async (key) => {
    try {
      const Data = {
        type: "revert",
        classification_id: key,
        id_: selectFileId.value,
      };
      const response = await postFileapi(qs.stringify(Data));

      if (response.data.obj.error == "") {
        console.log("接口请求成功:", response);
        message.success("恢复文件成功");
        // 更新
        fetchRecycleData();
      }
    } catch (error) {
      message.success("恢复文件失败");
      console.error("接口请求失败:", error);
    }
  };

  // 删除文件
  const realDelete = async (item, index) => {
    console.log(item);

    const formData = {
      type: "realDelete",
      id_: item.id_,
    };
    const response = await postFileapi(qs.stringify(formData));

    if (response.data.obj.error == "") {
      console.log("接口请求成功:", response);
      message.success(response.data.msg);
      fetchRecycleData();
    } else {
      message.error(response.data.obj.error);
    }
  };

  // 处理子组件 treeSelect 传来的更新
  const handleSelectSuccess = (selectValue) => {
    selectFolderOrLibrary.value = selectValue; // 更新名称
    recycleDemo(selectFolderOrLibrary.value);
  };
</script>
<style scoped>
  .editable-cell {
    align-items: center;
    display: flex;
  }
  .editable-row-operations a {
    margin-right: 8px;
  }

  .title {
    margin: 14px 0;
    font-size: 20px;
    font-family: SourceHanSansCN-Bold !important;
    color: #363b4c;
    font-weight: bold;
  }
</style>
