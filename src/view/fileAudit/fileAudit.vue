<template>
  <div style="padding: 0 20px">
    <div class="title">{{ title }}</div>

    <div style="margin: 15px">
      <a-form layout="inline" @submit.prevent="onSearch">
        <a-form-item label="文件名称">
          <a-input v-model:value="searchForm.file_name" placeholder="请输入文件名称" allow-clear />
        </a-form-item>

        <a-form-item label="审核状态">
          <a-select v-model:value="searchForm.audit_status" placeholder="请选择审核状态" allow-clear style="width: 180px">
            <a-select-option value="待审核">待审核</a-select-option>
            <a-select-option value="已通过">已通过</a-select-option>
            <a-select-option value="已驳回">已驳回</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="所属分类">
          <a-tree-select
            v-model:value="searchForm.classification_id"
            :tree-data="classificationTreeData"
            placeholder="请选择分类"
            allow-clear
            tree-default-expand-all
            show-search
            :field-names="{ label: 'name', value: 'value', children: 'children' }"
            style="width: 200px"
          />
        </a-form-item>

        <div style="margin-left: auto; display: flex; gap: 10px">
          <a-button type="primary" @click="onSearch" :loading="isSearch">搜索</a-button>
          <a-button @click="reset">重置</a-button>
          <a-button @click="getTreeData('freshTree')">刷新</a-button>
        </div>
      </a-form>
    </div>

    <a-table :dataSource="dataSource" bordered :rowKey="(record) => record.id_" :loading="isSearch">
      <a-table-column title="文件名称" dataIndex="file_name" key="file_name">
        <template #default="{ record }">
          <div class="editable-cell" @click="getPathUrl(record)"><img src="../../assets/file/doc.png" height="20px" style="margin-right: 6px" />{{ record.file_name }}</div>
        </template>
      </a-table-column>
      <a-table-column title="文件格式" dataIndex="file_suffix" key="file_suffix" />
      <a-table-column title="文件大小" dataIndex="file_size" key="file_size">
        <template #default="{ text }"> {{ (text / 1024).toFixed(2) }} KB </template>
      </a-table-column>
      <a-table-column title="审核状态" dataIndex="audit_status" key="audit_status" align="center">
        <template #default="{ record }">
          <a-tag v-if="record.audit_status === '待审核'" color="blue">进行中</a-tag>
          <a-tag v-else-if="record.audit_status === '审核通过'" color="green">审核通过</a-tag>
          <a-tag v-else-if="record.audit_status === '审核拒绝'" color="red">审核拒绝</a-tag>
          <a-tag v-else-if="record.audit_status === '4'" color="orange">申请延期</a-tag>
          <a-tag v-else>未知</a-tag>
        </template>
      </a-table-column>
      <a-table-column title="文件夹" dataIndex="classification_name" key="classification_name">
        <template #default="{ record }"> <img src="../../assets/file/folder.png" alt="" height="20px" />{{ record.classification_name }} </template>
      </a-table-column>
      <a-table-column title="创建人" dataIndex="create_name" key="create_name" />
      <a-table-column title="创建时间" dataIndex="create_time" key="create_time" />
      <a-table-column title="操作" key="operation" align="center">
        <template #default="{ record }">
          <template v-if="record.audit_status === '待审核'">
            <a-button type="link" @click="onEdit(record)" style="padding: 0 4px">编辑</a-button>
            <a-button type="link" @click="onDelete(record)" style="padding: 0 4px" danger>删除</a-button>
            <a-button type="link" @click="onDownload(record)" style="padding: 0 4px">下载</a-button>

            <template v-if="isAudit">
              <a-button type="link" @click="onPass(record)" style="padding: 0 4px">通过</a-button>
              <a-button type="link" @click="onReject(record)" style="padding: 0 4px" danger>驳回</a-button>
            </template>
          </template>

          <template v-else-if="record.audit_status === '已归档' && isAudit">
            <a-button type="link" @click="onDownload(record)" style="padding: 0 4px">下载</a-button>
            <a-button type="link" @click="onCancel(record)" style="padding: 0 4px" danger>取消</a-button>
          </template>

          <template v-else>
            <a-button type="link" @click="onDownload(record)" style="padding: 0 4px">下载</a-button>
          </template>

          <a-button type="link" @click="showLog(record)" style="padding: 0 4px">审核记录</a-button>
        </template>
      </a-table-column>
    </a-table>

    <!-- 审核抽屉组件 -->
    <AuditDrawer
      v-model:visible="drawerVisible"
      v-model:indexNav="indexNav"
      :record="currentRecord"
      :loading="loading"
      :auditType="fileAudit"
      :componentDisabled="isComponentDisabled"
      @pass="onPass"
      @reject="onReject"
      @cancel="onCancel"
      @show-log="showLog"
    />
  </div>
</template>

<script setup>
  import TreeSelect from "@/view/library/model/treeSelect.vue";
  import { onMounted, reactive, ref } from "vue";
  import { useRoute } from "vue-router";
  import { getFileAuthApi } from "../../api/index";
  import qs from "qs";
  import AuditDrawer from "@/view/fileAudit/AuditDrawer.vue";

  const isAudit = ref(true); // 替换为你的逻辑
  const dataSource = ref([]); // 数据源
  const route = useRoute();
  const title = ref(route.query.title);
  const classificationTreeData = ref([]);
  const personnelRef = ref(null);
  const settingRef = ref(null);
  const settingTitle = ref("");
  const auditDrawerRef = ref(null);
  const drawerVisible = ref(false);
  const currentRecord = ref(null);
  const indexNav = ref(0);
  const fileAudit = ref("");
  const loading = ref(false);
  const isComponentDisabled = ref(false);

  const pagination = reactive({
    type: "",
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showTotal: (total) => `共 ${total} 条`,
    onChange: (page, pageSize) => {
      pagination.current = page;
      pagination.pageSize = pageSize;
      fetchData();
    },
  });

  const searchForm = reactive({
    file_name: "",
    audit_status: "",
    classification_id: "",
  });

  // 是否处于搜索状态
  const isSearch = ref(false);

  onMounted(() => {
    fetchData();
    getTreeData("tree");
  });

  const fetchData = async () => {
    // 更新分页参数
    pagination.type = "fileList";
    try {
      // 标志是否为搜索
      isSearch.value = true;
      const response = await getFileAuthApi(
        qs.stringify({
          file_name: searchForm.file_name,
          audit_status: searchForm.audit_status,
          page: pagination.current,
          pageSize: pagination.pageSize,
          classification_id: searchForm.classification_id,
          type: "fileList",
        })
      );
      if (response.data.obj.error == "") {
        dataSource.value = response.data.obj.data.data; // 保存原始数据
        console.log("接口请求成功:", dataSource.value);
        // 更新总记录数
        pagination.total = response.data.obj.data.count;
      }
    } catch (error) {
      console.error("接口请求失败:", error);
    } finally {
      isSearch.value = false;
    }
  };

  const isGetTreeRequest = ref(false);

  const getTreeData = async (type) => {
    if (isGetTreeRequest.value) return; // 避免重复请求
    isGetTreeRequest.value = true;

    const request = {
      type: type,
    };

    try {
      const response = await getFileAuthApi(qs.stringify(request));
      console.log("接口请求成功:", response);

      const result = response?.data?.obj?.data || [];

      if (Array.isArray(result)) {
        classificationTreeData.value = result;
      } else {
        console.warn("分类树数据格式不正确:", result);
        classificationTreeData.value = [];
      }
    } catch (error) {
      console.error("接口请求失败:", error);
      classificationTreeData.value = [];
    } finally {
      isGetTreeRequest.value = false;
    }
  };

  // 重置
  function reset() {
    searchForm.file_name = "";
    searchForm.audit_status = "";
    searchForm.classification_id = "";
    onSearch();
  }

  function onSearch() {
    pagination.current = 1; // 搜索时回到第一页
    fetchData();
  }

  // 操作函数
  function onEdit(record) {
    console.log("编辑", record);
    currentRecord.value = record;
    drawerVisible.value = true;
    fileAudit.value = "edit";
  }

  function onDelete(record) {
    console.log("删除", record);
    currentRecord.value = record;
    drawerVisible.value = true;
    fileAudit.value = "delete";
  }

  function onDownload(record) {
    console.log("下载", record);
  }

  function onPass(record) {
    console.log("通过", record);
    currentRecord.value = record;
    drawerVisible.value = true;
    fileAudit.value = "pass";
    isComponentDisabled.value = true;
  }

  function onReject(record) {
    console.log("驳回", record);
    currentRecord.value = record;
    drawerVisible.value = true;
    fileAudit.value = "reject";
    isComponentDisabled.value = true;
  }

  function onCancel(record) {
    console.log("取消", record);
    drawerVisible.value = false;
  }

  function showLog(record) {
    console.log("查看日志", record);
    currentRecord.value = record;
    drawerVisible.value = true;
    fileAudit.value = "log";
    isComponentDisabled.value = true;
  }

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
</script>

<style scoped>
  .title {
    color: #494f6a;
    font-size: 14px;
    font-family: SourceHanSansCN-Bold !important;
    margin-bottom: 16px;
    margin-top: 10px;
  }

  .editable-cell {
    align-items: center;
    display: flex;
    color: #1677ff;
    cursor: pointer;
  }
</style>
