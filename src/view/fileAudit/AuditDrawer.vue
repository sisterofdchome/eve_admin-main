<template>
  <a-drawer :visible="visible" :title="`${record?.file_name || ''}审核`" width="800" @close="onClose">
    <div class="drawer-body">
      <a-tabs tab-position="left" class="custom-tabs" :activeKey="activeTab" @change="changeTab">
        <!-- 基本信息 -->
        <a-tab-pane key="info" tab="基本信息">
          <div class="tab-content">
            <a-form :model="record" name="basic" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }" autocomplete="off">
              <!-- <a-form-item label="文件ID" name="id_">
                <a-input v-model:value="record.id_" />
              </a-form-item> -->
              <a-form-item label="文件名称" name="file_name">
                <a-input v-model:value="record.file_name" :disabled="componentDisabled" />
              </a-form-item>
              <a-form-item label="文件格式" name="file_suffix">
                <a-input v-model:value="record.file_suffix" :disabled="componentDisabled" />
              </a-form-item>
              <a-form-item label="文件大小" name="file_size">
                <a-input v-model:value="record.file_size" :disabled="componentDisabled" />
              </a-form-item>
              <a-form-item label="文件路径" name="classification_name">
                <a-input v-model:value="record.classification_name" :disabled="componentDisabled" />
              </a-form-item>
              <a-form-item label="描述" name="classification_name" v-if="auditType === 'reject'">
                <a-textarea v-model:value="record.remark" placeholder="请输入文件描述" :rows="4" />
              </a-form-item>
              <a-form-item label="文件路径" name="attachment">
                <CustomUpload name="attachment" :value="fileList" @display="handleDisplay" :key="index"></CustomUpload>
              </a-form-item>
            </a-form>
          </div>
        </a-tab-pane>

        <!-- 审核日志 -->
        <a-tab-pane key="log" tab="审核日志">
          <div class="tab-content">
            <a-button type="link" @click="getLogList" style="margin-bottom: 12px">刷新<RedoOutlined :spin="logLoading" /></a-button>
            <a-table :columns="columns" :data-source="dataLog" row-key="id_" :pagination="false" :scroll="{ x: 1000 }" :loading="logLoading" />
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- 操作按钮 -->
    <div class="button-box">
      <template v-if="auditType === 'edit'">
        <a-button type="primary" :loading="loading">保存</a-button>
      </template>
      <template v-else-if="auditType === 'pass'">
        <a-button type="primary" :loading="loading" @click="passAudit">通过</a-button>
      </template>
      <template v-else-if="auditType === 'reject'">
        <a-button type="primary" :loading="loading">驳回</a-button>
      </template>
      <template v-else-if="auditType === 'cancel'">
        <a-button type="primary" :loading="loading">取消</a-button>
      </template>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
  import { ref } from "vue";
  import { getFileAuthApi, getLogApi } from "../../api/index";
  import qs from "qs";
  import { message } from "ant-design-vue";
  import { RedoOutlined } from "@ant-design/icons-vue";
  import CustomUpload from "../../components/customUpload.vue";

  const props = defineProps<{
    visible: boolean;
    record: any;
    loading?: boolean;
    indexNav: number;
    auditType: string;
    componentDisabled: boolean;
  }>();

  const index = ref(0);
  const fileList = ref([]);

  const dataLog = ref([]);
  const columns = [
    {
      title: "操作类型",
      dataIndex: "operation_type",
      key: "operation_type",
    },
    {
      title: "表名",
      dataIndex: "table_from",
      key: "table_from",
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "操作人",
      dataIndex: "create_name",
      key: "create_name",
    },
    {
      title: "操作时间",
      dataIndex: "create_time",
      key: "create_time",
    },
  ];

  const diffColumns = [
    { title: "字段", dataIndex: "field", key: "field" },
    { title: "旧值", dataIndex: "oldValue", key: "oldValue" },
    { title: "新值", dataIndex: "newValue", key: "newValue" },
  ];

  const handleDisplay = (data) => {
    console.log("handleDisplay", data);
    fileList.value = data.value ? JSON.parse(data.value) : [];
  };
  const formatValue = (val: any) => {
    if (typeof val === "number" && String(val).length === 13) {
      return new Date(val).toLocaleString();
    }
    return val ?? "-";
  };

  const getDiffRows = (record: any) => {
    const oldData = JSON.parse(record.old_data)?.columns ?? {};
    const newData = JSON.parse(record.new_data)?.columns ?? {};
    const allKeys = Array.from(new Set([...Object.keys(oldData), ...Object.keys(newData)]));
    return allKeys.map((key) => ({
      key,
      field: key,
      oldValue: formatValue(oldData[key]),
      newValue: formatValue(newData[key]),
    }));
  };

  const isSubmitRequest = ref(false);

  const passAudit = async () => {
    if (isSubmitRequest.value) return;

    isSubmitRequest.value = true;
    try {
      const response = await getFileAuthApi(
        qs.stringify({
          id_: props.record.id_,
          type: "pass",
        })
      );

      if (response.code === 1) {
        message.success("审核通过成功");
        emit("update:visible", false); // 正确关闭抽屉
      } else {
        message.error(response.msg || "审核失败");
      }
    } catch (error) {
      console.error("审核请求出错:", error);
      message.error("请求出错，请稍后重试");
    } finally {
      isSubmitRequest.value = false;
    }
  };

  const activeTab = ref("info");

  const changeTab = (key: string) => {
    activeTab.value = key;
    if (key === "log") {
      getLogList();
    }
  };

  const logLoading = ref(false);

  const getLogList = async () => {
    if (isSubmitRequest.value) return;
    isSubmitRequest.value = true;

    // 显示加载中
    logLoading.value = true;

    try {
      const response = await getLogApi(
        qs.stringify({
          id_: props.record.id_,
          type: "page",
        })
      );

      if (response.data.code === 1) {
        message.success("获取日志成功");
        dataLog.value = response.data.obj.data.data || [];
      } else {
        message.error(response.data.obj.msg || "获取日志失败");
      }
    } catch (error) {
      console.error("获取日志请求出错:", error);
      message.error("请求出错，请稍后重试");
    } finally {
      isSubmitRequest.value = false;
      logLoading.value = false;
    }
  };

  const settingNav = [
    { name: "文件信息", icon: "FileTextOutlined" },
    { name: "审核流程", icon: "ClusterOutlined" },
    { name: "审核设置", icon: "SettingOutlined" },
  ];

  const emit = defineEmits<{
    (e: "update:visible", val: boolean): void;
    (e: "pass", record: any): void;
    (e: "reject", record: any): void;
    (e: "cancel", record: any): void;
    (e: "show-log", record: any): void;
  }>();

  function onClose() {
    emit("update:visible", false);
  }
</script>

<style scoped>
  .nav-content {
    padding: 16px;
  }

  .auth-box {
    background: #f5f5f5;
    padding: 12px;
    border-radius: 8px;
  }

  .item-title .title {
    font-weight: bold;
  }

  .drawer-body {
    display: flex;
    height: calc(100% - 60px); /* 留出底部按钮区域 */
    overflow: hidden;
  }

  .custom-tabs {
    width: 100%;
    display: flex;
    flex-direction: row;
  }

  .custom-tabs .ant-tabs-nav {
    min-width: 120px;
    border-right: 1px solid #e8e8e8;
    background: #fafafa;
    padding-top: 8px;
  }

  .tab-content {
    padding: 16px;
    overflow-y: auto;
    max-height: 100%;
  }

  .button-box {
    margin-top: 20px;
    text-align: right;
    position: absolute;
    bottom: 16px;
    right: 24px;
    width: calc(100% - 48px);
    background: #fff;
    padding-top: 12px;
  }
</style>
