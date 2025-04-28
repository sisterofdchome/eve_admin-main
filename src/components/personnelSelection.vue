<template>
  <a-modal v-model:visible="personVisible" title="人员选择" centered @ok="handleOk" width="730px">
    <div class="user-info-list">
      <div class="user-info-left">
        <div class="user-info-title">
          <div :class="index == userTabActive ? 'user-tab-item user-tab-active' : 'user-tab-item'" v-for="(item, index) in userTabList" @click="userTabActive = index">{{ item.name }}</div>
        </div>
        <div class="user-info-body">
          <div class="search-box">
            <a-input v-model:value="condition" placeholder="请输入手机号或名字搜索">
              <template #prefix>
                <SearchOutlined />
              </template>
            </a-input>
          </div>
          <div class="content" v-if="userTabActive == 0">
            <div class="check-box-item" v-for="item in userList" @click="selHandle(item, 'user')">
              <template v-if="!isChecked(item.id, 'user')">
                <BorderOutlined class="icon" />
              </template>
              <template v-else>
                <CheckSquareFilled style="color: #1677ff; font-size: 18px" />
              </template>
              <img src="../assets/libary/userHead.png" />
              <span class="name">{{ item.fullname }}</span>
            </div>
          </div>
          <div class="content no-user-content" v-if="userTabActive == 1">
            <div class="check-box-item" v-for="item in deptList" @click="selHandle(item, 'dept')">
              <template v-if="!isChecked(item.id, 'dept')">
                <BorderOutlined class="icon" />
              </template>
              <template v-else>
                <CheckSquareFilled style="color: #1677ff; font-size: 18px" />
              </template>
              <span class="name">{{ item.name }}</span>
            </div>
          </div>
          <div class="content no-user-content" v-if="userTabActive == 2">
            <div class="check-box-item" v-for="item in roleList" @click="selHandle(item, 'role')">
              <template v-if="!isChecked(item.id, 'role')">
                <BorderOutlined class="icon" />
              </template>
              <template v-else>
                <CheckSquareFilled style="color: #1677ff; font-size: 18px" />
              </template>
              <span class="name">{{ item.name }}</span>
            </div>
          </div>
          <div class="page">
            <a-pagination size="small" :total="50" :show-total="(total) => `共 ${total} 条数据`" show-quick-jumper />
          </div>
        </div>
      </div>
      <div class="user-info-right">
        <div class="user-right-title">
          <div class="num">已选({{ selectUserList.length }})</div>
          <div class="clear" @click="selectUserList = []">清空</div>
        </div>
        <div class="user-right-content">
          <div class="cehck-item" v-for="item in selectUserList">
            <div class="check-item-info">
              <img src="../assets/libary/userHead.png" v-if="item.type == 'user'" />
              <span v-else-if="item.type == 'role'">（角色）</span>
              <span :title="item.name">{{ item.name }}</span>
            </div>
            <CloseCircleFilled class="close-icon" @click="selHandle(item, item.type)" />
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
  import { ref, watch, onMounted } from "vue";
  import { BorderOutlined, SearchOutlined, CheckSquareFilled, CloseCircleFilled } from "@ant-design/icons-vue";
  import { postUserListJson, postTreeDataByDemid } from "../api/index.js";
  import qs from "qs";

  const userTabActive = ref(0);
  const userTabList = ref([
    {
      name: "人员",
      id: 0,
    },
    // {
    //   name: "角色",
    //   id: 1,
    // },
    {
      name: "部门",
      id: 2,
    },
    // {
    //   name: "岗位",
    //   id: 3,
    // },
    // {
    //   name: "群组",
    //   id: 4,
    // },
  ]);
  const userList = ref([
    {
      id: 1,
      name: "张三1",
      photo: "https://knowledge.bctools.cn/jvs-knowledge-ui/static/user-f3df3034.png",
    },
    {
      id: 2,
      name: "张三2",
      photo: "https://knowledge.bctools.cn/jvs-knowledge-ui/static/user-f3df3034.png",
    },
    {
      id: 3,
      name: "张三3",
      photo: "https://knowledge.bctools.cn/jvs-knowledge-ui/static/user-f3df3034.png",
    },
    {
      id: 4,
      name: "张三4",
      photo: "https://knowledge.bctools.cn/jvs-knowledge-ui/static/user-f3df3034.png",
    },
    {
      id: 5,
      name: "张三5",
      photo: "https://knowledge.bctools.cn/jvs-knowledge-ui/static/user-f3df3034.png",
    },
    {
      id: 6,
      name: "张三6",
      photo: "https://knowledge.bctools.cn/jvs-knowledge-ui/static/user-f3df3034.png",
    },
    {
      id: 7,
      name: "张三7",
      photo: "https://knowledge.bctools.cn/jvs-knowledge-ui/static/user-f3df3034.png",
    },
    {
      id: 8,
      name: "张三8",
      photo: "https://knowledge.bctools.cn/jvs-knowledge-ui/static/user-f3df3034.png",
    },
    {
      id: 9,
      name: "张三9",
      photo: "https://knowledge.bctools.cn/jvs-knowledge-ui/static/user-f3df3034.png",
    },
  ]);

  const roleList = ref([
    {
      id: 1,
      name: "角色1",
    },
    {
      id: 2,
      name: "角色2",
    },
    {
      id: 3,
      name: "角色3",
    },
    {
      id: 4,
      name: "角色4",
    },
    {
      id: 5,
      name: "角色5",
    },
    {
      id: 6,
      name: "角色6",
    },
    {
      id: 7,
      name: "角色7",
    },
    {
      id: 8,
      name: "角色8",
    },
    {
      id: 9,
      name: "角色9",
    },
  ]);
  const deptList = ref([
    {
      id: 1,
      name: "部门1",
    },
    {
      id: 2,
      name: "部门2",
    },
    {
      id: 3,
      name: "部门3",
    },
    {
      id: 4,
      name: "部门4",
    },
    {
      id: 5,
      name: "部门5",
    },
    {
      id: 6,
      name: "部门6",
    },
    {
      id: 7,
      name: "部门7",
    },
    {
      id: 8,
      name: "部门8",
    },
    {
      id: 9,
      name: "部门9",
    },
  ]);

  onMounted(() => {
    console.log(deptList.value);
    getTreeDataByDemid();
    getUserListJson();
  });
  // 获取人员选择
  const getUserListJson = async () => {
    const data = {
      page: 1,
      rows: 30,
      // "Q^fullname_^SL": "邓",
    };
    let res = await postUserListJson(qs.stringify(data));
    // demid: id
    console.log(res);
    // userList.value = res.data.rows;
    userList.value = res.data.rows.map((item) => ({
      ...item,
      name: item.fullname, // 将 fullname 赋值给 name
    }));
    console.log(userList.value);
  };
  // 获取公司选择
  const getTreeDataByDemid = async () => {
    let res = await postTreeDataByDemid({});
    // demid: id
    console.log(res);
    deptList.value = res.data;
  };

  const total = ref(50);
  const isChecked = (id, type) => {
    //判断是否选中
    return selectUserList.value.findIndex((item) => item.id === id && item.type === type) !== -1;
  };
  const selectUserList = ref([]);
  const condition = ref("");
  const personVisible = ref(false);
  const selHandle = (user, type) => {
    console.log(user);
    //判断user是否在selectUserList中，存在则删除，不存在则添加
    let index = selectUserList.value.findIndex((item) => item.id === user.id && item.type === type);
    if (index !== -1) {
      selectUserList.value.splice(index, 1);
    } else {
      user.type = type;
      selectUserList.value.push(user);
    }

    console.log(selectUserList.value);
  };
  const searchUser = () => {
    //搜索
  };
  const closePersonVisible = () => {
    personVisible.value = false;
  };
  const showPersonVisible = (index, userList) => {
    personVisible.value = true;
    currentIndex.value = index;
    selectUserList.value = userList;
  };
  // 新增事件发射
  const emit = defineEmits(["submitUsers"]);

  const currentIndex = ref("");

  const handleOk = () => {
    personVisible.value = false;
    emit("submitUsers", selectUserList.value, currentIndex.value); // 发射选中数据
  };

  defineExpose({
    showPersonVisible,
  });
</script>

<style>
  .user-info-list {
    display: flex;
  }

  .user-info-list .user-info-left {
    width: 460px;
    border-right: 1px solid #eeeff0;
  }

  .user-info-list .user-info-right {
    width: calc(100% - 460px);
  }

  .user-info-list .user-info-left .user-info-title {
    display: flex;
    align-items: center;
    height: 40px;
    padding: 0 15px;
    border-bottom: 1px solid #eeeff0;
  }

  .user-info-list .user-info-left .user-info-title .user-tab-item {
    height: 40px;
    font-size: 14px;
    color: #6f7588;
    cursor: pointer;
    position: relative;
    display: flex;
    align-items: center;
  }

  .user-info-list .user-info-left .user-info-title .user-tab-active {
    color: #1e6fff;
    font-size: 14px;
    font-weight: 700;
  }

  .user-info-list .user-info-left .user-info-body {
    height: 370px;
  }

  .user-info-list .user-info-left .user-info-body .search-box {
    display: flex;
    align-items: center;
    margin: 16px 32px 16px 24px;
    background: #f5f6f7;
    border-radius: 4px;
  }

  .user-info-list .user-info-left .user-info-body .content {
    height: 283px;
    overflow: overlay;
  }

  .user-info-list .user-info-left .user-info-body .no-user-content {
    height: 323px;
    overflow: overlay;
  }

  .user-info-list .user-info-left .user-info-title .user-tab-item + .user-tab-item {
    margin-left: 32px;
  }

  .user-info-list .user-info-left .user-info-title .user-tab-active:after {
    position: absolute;
    left: 0;
    content: "";
    bottom: 0;
    width: 100%;
    height: 3px;
    background: #1e6fff;
    border-radius: 2px 0;
  }

  .search-box .h-line {
    height: 14px;
    background-color: #d7d8db;
    width: 1px;
    margin-left: 0;
    margin-right: 0;
  }

  .check-box-item {
    margin: 0 8px;
    height: 36px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 0 16px 0 24px;
  }

  .check-box-item img {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    margin-left: 12px;
  }

  .check-box-item .icon {
    width: 18px;
    height: 18px;
    min-width: 18px;
    cursor: pointer;
    color: #a0a3ad;
    font-size: 18px;
  }

  .check-box-item .name {
    margin-left: 12px;
  }

  .user-info-list .user-info-left .user-info-body .page {
    display: flex;
    align-items: center;
    justify-content: end;
    font-size: 14px;
    color: #575e73;
    height: 39px;
    padding-right: 24px;
    border-top: 1px solid #eeeff0;
  }

  .user-info-list .user-info-right .user-right-content .cehck-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 30px;
    padding: 0 0px 0 24px;
  }

  .user-info-list .user-info-right .user-right-title {
    padding: 0 0px 0 24px;
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    height: 40px;
    align-items: center;
  }

  .user-info-list .user-info-right .user-right-title .num {
    color: #494f6a;
  }

  .user-info-list .user-info-right .user-right-title .clear {
    color: #1e6fff;
    cursor: pointer;
  }

  .cehck-item .check-item-info {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .close-icon {
    width: 14px;
    min-width: 14px;
    height: 14px;
    cursor: pointer;
    color: #c2c5cf;
  }

  .check-item-info img {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    margin-right: 12px;
  }
</style>
