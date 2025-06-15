<template>
  <a-drawer
      :visible="visible"
      :title="`${record?.file_name || ''}审核`"
      width="800"
      @close="onClose"
  >

    <a-form
        :model="record"
        name="basic"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
        :disabled="componentDisabled"
    >

      <a-form-item
          label="文件ID"
          name="id_"
      >
        <a-input v-model:value="record.id_"/>
      </a-form-item>

      <a-form-item
          label="文件名称"
          name="file_name"
      >
        <a-input v-model:value="record.file_name"/>
      </a-form-item>

      <a-form-item
          label="文件格式"
          name="file_suffix"
      >
        <a-input v-model:value="record.file_suffix"/>
      </a-form-item>


      <a-form-item
          label="文件大小"
          name="file_size"
      >
        <a-input v-model:value="record.file_size"/>
      </a-form-item>

      <a-form-item
          label="文件路径"
          name="classification_name"
      >
        <a-input v-model:value="record.classification_name"/>
      </a-form-item>

    </a-form>

<!--    日志区-->
    <a-table
        :columns="columns"
        :data-source="dataLog"
        row-key="id_"
        :pagination="false"
        :scroll="{ x: 1000 }"
    >
<!--      <template #expandedRowRender="{ record }">-->
<!--        <a-table-->
<!--            size="small"-->
<!--            :columns="diffColumns"-->
<!--            :data-source="getDiffRows(record)"-->
<!--            :pagination="false"-->
<!--        />-->
<!--      </template>-->
    </a-table>




    <!-- 按钮区 -->
    <div class="button-box" style="margin-top: 20px; text-align: right">
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

      <a-button type="link" @click="getLogList" style="margin-left: 12px">查看日志</a-button>
    </div>


  </a-drawer>


</template>


<script setup lang="ts">
import {ref} from "vue";
import {getFileAuthApi, getLogApi} from "../../api/index";
import qs from "qs";
import {message} from "ant-design-vue";

const props = defineProps<{
  visible: boolean
  record: any
  loading?: boolean
  indexNav: number
  auditType: string
  componentDisabled: boolean
}>()

const dataLog = ref([])
const columns = [
  {
    title: '操作类型',
    dataIndex: 'operation_type',
    key: 'operation_type',
  },
  {
    title: '表名',
    dataIndex: 'table_from',
    key: 'table_from',
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: '操作人',
    dataIndex: 'create_name',
    key: 'create_name',
  },
  {
    title: '操作时间',
    dataIndex: 'create_time',
    key: 'create_time',
  },
]

const diffColumns = [
  { title: '字段', dataIndex: 'field', key: 'field' },
  { title: '旧值', dataIndex: 'oldValue', key: 'oldValue' },
  { title: '新值', dataIndex: 'newValue', key: 'newValue' },
]

const formatValue = (val: any) => {
  if (typeof val === 'number' && String(val).length === 13) {
    return new Date(val).toLocaleString()
  }
  return val ?? '-'
}

const getDiffRows = (record: any) => {
  const oldData = JSON.parse(record.old_data)?.columns ?? {}
  const newData = JSON.parse(record.new_data)?.columns ?? {}
  const allKeys = Array.from(new Set([...Object.keys(oldData), ...Object.keys(newData)]))
  return allKeys.map((key) => ({
    key,
    field: key,
    oldValue: formatValue(oldData[key]),
    newValue: formatValue(newData[key]),
  }))
}



const isSubmitRequest = ref(false)

const passAudit = async () => {
  if (isSubmitRequest.value) return

  isSubmitRequest.value = true
  try {
    const response = await getFileAuthApi(qs.stringify({
      id_: props.record.id_,
      type: 'pass',
    }))

    if (response.code === 1) {
      message.success('审核通过成功')
      emit('update:visible', false) // 正确关闭抽屉
    } else {
      message.error(response.msg || '审核失败')
    }
  } catch (error) {
    console.error('审核请求出错:', error)
    message.error('请求出错，请稍后重试')
  } finally {
    isSubmitRequest.value = false
  }
}


const getLogList = async () => {
  if (isSubmitRequest.value) return
  isSubmitRequest.value = true

  try {
    const response = await getLogApi(qs.stringify({
      id_: props.record.id_,
      type: 'page',
    }))

    if (response.data.code === 1) {
      message.success('获取日志成功')
      dataLog.value = response.data.obj.data.data || []
    } else {
      message.error(response.data.obj.msg || '获取日志失败')
    }
  } catch (error) {
    console.error('获取日志请求出错:', error)
    message.error('请求出错，请稍后重试')
  } finally {
    isSubmitRequest.value = false
  }
}



const settingNav = [
  {name: '文件信息', icon: 'FileTextOutlined'},
  {name: '审核流程', icon: 'ClusterOutlined'},
  {name: '审核设置', icon: 'SettingOutlined'},
]

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'pass', record: any): void
  (e: 'reject', record: any): void
  (e: 'cancel', record: any): void
  (e: 'show-log', record: any): void
}>()

function onClose() {
  emit('update:visible', false)
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
</style>
