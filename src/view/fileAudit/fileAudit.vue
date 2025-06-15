<template>

  <div style="padding: 0 20px">
    <div class="title">{{ title }}</div>

    <div style="margin: 15px">

      <a-form layout="inline" @submit.prevent="onSearch">
        <a-form-item label="文件名称">
          <a-input v-model:value="searchForm.file_name" placeholder="请输入文件名称" allow-clear/>
        </a-form-item>

        <a-form-item label="审核状态">
          <a-select v-model:value="searchForm.audit_status" placeholder="请选择审核状态" allow-clear
                    style="width: 150px;">
            <a-select-option value="待审核">待审核</a-select-option>
            <a-select-option value="已通过">已通过</a-select-option>
            <a-select-option value="已驳回">已驳回</a-select-option>
          </a-select>
        </a-form-item>


        <!--        TODO -->
        <a-form-item label="所属分类">
          <a-tree-select
              v-model:value="searchForm.classification_id"
              :tree-data="classificationTreeData"
              placeholder="请选择分类"
              allow-clear
              tree-default-expand-all
              show-search
              style="width: 200px;"
              :field-names="{ label: 'name', value: 'value', children: 'children' }"
          />
        </a-form-item>


        <a-form-item>
          <a-button type="primary" @click="onSearch" :loading="isSearch">搜索</a-button>
          <a-button @click="reset" style="margin-left: 8px;">重置</a-button>
          <a-button @click="getTreeData('freshTree')" style="margin-left: 8px;">刷新</a-button>
        </a-form-item>
      </a-form>


    </div>


    <a-table
        :columns="columns"
        :data-source="dataSource"
        bordered
        :pagination="pagination"
        row-key="id"
    >
      <template #bodyCell="{ column, record }">


        <template v-if="column.dataIndex === 'audit_status'">
          <div v-if="record.audit_status == '待审核'">
            <a-tag color="blue">进行中</a-tag>
          </div>
          <div v-else-if="record.audit_status == '审核通过'">
            <a-tag color="green">审核通过</a-tag>
          </div>
          <div v-else-if="record.audit_status == '审核拒绝'">
            <a-tag color="red">审核拒绝</a-tag>
          </div>
          <div v-else-if="record.audit_status == '4'">
            <a-tag color="orange">申请延期</a-tag>
          </div>
        </template>

        <template v-if="column.dataIndex === 'operation'">
          <div class="editable-row-operations">
            <!-- 待审核状态 -->
            <template v-if="record.audit_status === '待审核'">
              <a @click="onEdit(record)">编辑</a>
              <a-divider type="vertical"/>
              <a @click="onDelete(record)" style="color: red;">删除</a>
              <a-divider type="vertical"/>
              <a @click="onDownload(record)">下载</a>
              <template v-if="isAudit">
                <a-divider type="vertical"/>
                <a @click="onPass(record)">通过</a>
                <a-divider type="vertical"/>
                <a @click="onReject(record)" style="color: red;">驳回</a>
              </template>
            </template>

            <!-- 已归档状态 -->
            <template v-else-if="record.audit_status === '已归档'">
              <a @click="onDownload(record)">下载</a>
              <template v-if="isAudit">
                <a-divider type="vertical"/>
                <a @click="onCancel(record)">取消</a>
              </template>
            </template>

            <!-- 已驳回状态 -->
            <template v-else-if="record.audit_status === '已驳回'">
              <a @click="onEdit(record)">编辑</a>
              <a-divider type="vertical"/>
              <a @click="onDownload(record)">下载</a>
              <a-divider type="vertical"/>
              <a @click="onDelete(record)" style="color: red;">删除</a>
            </template>
            <a-divider type="vertical"/>
            <a @click="showLog(record)" style="color: black;">审核记录</a>
          </div>
        </template>
      </template>
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
import {onMounted, reactive, ref} from "vue";
import {useRoute} from "vue-router";
import {getFileAuthApi} from "../../api/index";
import qs from "qs";
import Personnel from "@/view/library/model/personnel.vue";
import AuditDrawer from "@/view/fileAudit/AuditDrawer.vue";

const isAudit = ref(true) // 替换为你的逻辑
const dataSource = ref([]) // 数据源
const route = useRoute();
const title = ref(route.query.title);
const classificationTreeData = ref([]);
const personnelRef = ref(null);
const settingRef = ref(null);
const settingTitle = ref('')
const auditDrawerRef = ref(null);
const drawerVisible = ref(false)
const currentRecord = ref(null);
const indexNav = ref(0)
const fileAudit = ref("")
const loading = ref(false)
const isComponentDisabled = ref(false)

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
  file_name: '',
  audit_status: '',
  classification_id: ''
})


// 是否处于搜索状态
const isSearch = ref(false)


const columns = [
  {
    title: "文件名称",
    dataIndex: "file_name",
  },
  // {
  //   title: "文件类型",
  //   dataIndex: "file_type",
  // },
  {
    title: "文件格式",
    dataIndex: "file_suffix",
  },
  {
    title: "文件大小",
    dataIndex: "file_size",
    customRender: ({text}) => `${(text / 1024).toFixed(2)} KB`, // 转换为 KB 显示
  },
  {
    title: "审核状态",
    dataIndex: "audit_status",
  },
  {
    title: "文件夹",
    dataIndex: "classification_name",
  },
  {
    title: "创建人",
    dataIndex: "create_name",
  },
  {
    title: "创建时间",
    dataIndex: "create_time",
  },
  {
    title: '操作',
    dataIndex: 'operation',
    key: 'operation',
    align: 'center',
    width: 450,
  },
]


onMounted(() => {
  fetchData();
  getTreeData('tree');
});


const fetchData = async () => {
  // 更新分页参数
  pagination.type = "fileList"
  try {
    // 标志是否为搜索
    isSearch.value = true
    const response = await getFileAuthApi(qs.stringify({
      file_name: searchForm.file_name,
      audit_status: searchForm.audit_status,
      page: pagination.current,
      pageSize: pagination.pageSize,
      classification_id: searchForm.classification_id,
      type: "fileList",
    }));
    if (response.data.obj.error == "") {
      dataSource.value = response.data.obj.data.data; // 保存原始数据
      // 更新总记录数
      pagination.total = response.data.obj.data.count;
    }
  } catch (error) {
    console.error("接口请求失败:", error);
  } finally {
    isSearch.value = false
  }
}

const isGetTreeRequest = ref(false)

const getTreeData = async (type) => {
  if (isGetTreeRequest.value) return  // 避免重复请求
  isGetTreeRequest.value = true

  const request = {
    type: type,
  }

  try {
    const response = await getFileAuthApi(qs.stringify(request))
    console.log("接口请求成功:", response)

    const result = response?.data?.obj?.data || []

    if (Array.isArray(result)) {
      classificationTreeData.value = result
    } else {
      console.warn("分类树数据格式不正确:", result)
      classificationTreeData.value = []
    }
  } catch (error) {
    console.error("接口请求失败:", error)
    classificationTreeData.value = []
  } finally {
    isGetTreeRequest.value = false
  }
}

// 重置
function reset() {
  searchForm.file_name = ''
  searchForm.audit_status = ''
  searchForm.classification_id = ''
  onSearch()
}


function onSearch() {
  pagination.current = 1 // 搜索时回到第一页
  fetchData()
}

// 操作函数
function onEdit(record) {
  console.log('编辑', record)
  currentRecord.value = record
  drawerVisible.value = true
  fileAudit.value = "edit"

}

function onDelete(record) {
  console.log('删除', record)
  currentRecord.value = record
  drawerVisible.value = true
  fileAudit.value = "delete"
}

function onDownload(record) {
  console.log('下载', record)
}

function onPass(record) {
  console.log('通过', record)
  currentRecord.value = record
  drawerVisible.value = true
  fileAudit.value = "pass"
  isComponentDisabled.value = true
}

function onReject(record) {
  console.log('驳回', record)
}

function onCancel(record) {
  console.log('取消', record)
  drawerVisible.value = false
}

function showLog(record) {
  console.log('查看日志', record)
  currentRecord.value = record
  drawerVisible.value = true
  fileAudit.value = "log"
  isComponentDisabled.value = true
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
</style>
