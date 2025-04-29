<template>
  <a-drawer :title="`${title}设置`" :placement="placement" :closable="false" :visible="visible" @close="onClose" width="800px" class="setting-drawer">
    <div class="know-set-body">
      <div class="nav-list">
        <div :class="indexNav == index ? 'nav-item nav-active' : 'nav-item'" v-for="(item, index) in settingNav" @click="changeMenu(index)">
          <component :key="index" :is="item.icon" class="nav-icon" />{{ item.name }}
        </div>
      </div>
      <div class="nav-body" v-if="indexNav == 0">
        <div class="nav-title">文库信息</div>
        <div class="nav-content">
          <div class="baseinfo-box">
            <a-form ref="libraryformRef" :model="formState" name="basic" autocomplete="off" @finish="onFinish" @finishFailed="onFinishFailed" layout="vertical">
              <a-form-item :label="settingTitle + '名称'" name="classification_name" :rules="[{ required: true, message: '请输入名称' }]">
                <a-input v-model:value="formState.classification_name" :placeholder="'请输入' + settingTitle + '名称'" />
              </a-form-item>

              <a-form-item :label="settingTitle + '描述'" name="description" v-if="settingTitle == '文库'">
                <a-textarea v-model:value="formState.description" placeholder="请输入文库描述" :rows="4" />
              </a-form-item>
            </a-form>
          </div>
          <!-- <div class="auth-box">
            <div class="item-title sticky-header">
              <span class="title">成员权限</span>
              <span class="add-auth"> <PlusOutlined />添加权限组 </span>
            </div>
            <div class="permission-content-item">
              <div class="add-or-del-box">
                <div class="add" @click="addPerson()"><PlusOutlined />添加成员</div>
                <div class="del"><DeleteOutlined />删除权限组</div>
              </div>
              <div class="persion-list-box"></div>
              <div class="checked-auth-list">
                <div>
                  <a-checkbox v-model:checked="checkAll" :indeterminate="indeterminate" @change="onCheckAllChange"> 全选 </a-checkbox>
                </div>
                <a-checkbox-group v-model:value="checkedList">
                  <template #default>
                    <a-row>
                      <a-col :span="8" v-for="option in settingOptin">
                        <a-checkbox :value="option.value">{{ option.name }}</a-checkbox>
                      </a-col>
                    </a-row>
                  </template>
                </a-checkbox-group>
              </div>
            </div>
          </div> -->
        </div>
        <div class="button-box">
          <a-button type="primary" @click="saveHandleOk">保存设置</a-button>
          <a-button style="margin-left: 12px" @click="visible = false">取消</a-button>
        </div>
      </div>
      <div class="nav-body" v-if="indexNav == 1">
        <div class="nav-title">{{ title }}权限</div>
        <div class="nav-content">
          <div class="auth-box">
            <div class="item-title">
              <span class="title">成员权限</span>
              <span class="add-auth" @click="showAddGroupModal"> <PlusOutlined />添加权限组 </span>
            </div>

            <div class="permission-content-item" v-for="(group, index) in permissionGroups" :key="index">
              <!-- <div class="group-header">
                <a-input v-if="group.editing" v-model:value="group.tempName" @pressEnter="saveGroupName(index)" />
                <span v-else class="group-title" @dblclick="editGroupName(index)">{{ group.name }}</span>
                <span class="group-actions">
                  <a-button type="text" @click="editGroupName(index)" v-if="!group.editing">
                    <EditOutlined />
                  </a-button>
                  <a-button type="text" danger @click="showDeleteConfirm(index)">
                    <DeleteOutlined />
                  </a-button>
                </span>
              </div> -->

              <div class="add-or-del-box">
                <div class="add" @click="addPerson(index)"><PlusOutlined />添加成员</div>
                <div class="del" @click="deletePermissionGroup(index)"><DeleteOutlined />删除权限组</div>
              </div>

              <div class="persion-list-box">
                <div v-for="user in group.members" :key="user.id" class="user-item">
                  <img v-if="user.type === 'user'" src="../../../assets/libary/userHead.png" />
                  <span>{{ user.name }}</span>
                  <!-- <CloseCircleOutlined @click="removeUser(index, user.id)" /> -->
                </div>
              </div>

              <div class="checked-auth-list">
                <div>
                  <a-checkbox :checked="isGroupAllChecked(index)" :indeterminate="isGroupIndeterminate(index)" @change="(e) => onGroupCheckAllChange(e, index)"> 全选 </a-checkbox>
                </div>
                <a-checkbox-group v-model:value="group.permissions">
                  <a-row>
                    <a-col :span="8" v-for="option in settingOptin">
                      <a-checkbox :value="option.value">{{ option.name }}</a-checkbox>
                    </a-col>
                  </a-row>
                </a-checkbox-group>
              </div>
            </div>
          </div>
        </div>
        <div class="button-box">
          <a-button type="primary" @click="saveAllPermissions">保存设置</a-button>
          <a-button style="margin-left: 12px" @click="visible = false">取消</a-button>
        </div>
      </div>

      <!-- 添加权限组模态框 -->
      <a-modal v-model:visible="addGroupModalVisible" title="添加权限组" @ok="handleAddGroup" @cancel="addGroupModalVisible = false">
        <a-input v-model:value="newGroupName" placeholder="请输入权限组名称" />
      </a-modal>
    </div>
  </a-drawer>
  <PersonnelSelection ref="personRef" @submit-users="handleUserSubmit"></PersonnelSelection>
</template>

<script setup>
  import PersonnelSelection from "../../../components/personnelSelection.vue";
  import { ref, reactive, watch, onMounted } from "vue";
  import { FileTextOutlined, FileSearchOutlined, BellOutlined, InteractionOutlined, PlusOutlined, DeleteOutlined, CloseCircleOutlined, EditOutlined } from "@ant-design/icons-vue";
  import { message, Modal } from "ant-design-vue";

  // 引入appStore
  import { useAppStore } from "../../../store/module/app";
  const appStore = useAppStore();

  import { postlibraryapi, postFileapi, postPermissionApi } from "../../../api/index.js";
  // 引入appStore中的属性
  import qs from "qs";
  import { storeToRefs } from "pinia";
  const { selectedKeys, selectedChildren } = storeToRefs(appStore);

  // 接收父组件传递的 props
  const props = defineProps({
    title: {
      type: String, // 类型可以根据需要调整，例如 Number, Object 等
      default: "", // 默认值
    },
  });

  const libraryformRef = ref();
  const personRef = ref(null);
  const settingNav = ref([
    {
      name: "基础设置",
      icon: FileTextOutlined,
    },
    {
      name: "权限",
      icon: FileSearchOutlined,
    },
    // {
    //   name: "消息设置",
    //   icon: BellOutlined,
    // },
    // {
    //   name: "文库转移",
    //   icon: InteractionOutlined,
    // },
  ]);
  const formState = reactive({
    classification_name: "",
    description: "",
  });

  onMounted(() => {
    // 获取权限数据
    getPermission();
  });
  // 新增响应式数据
  const selectedUsers = ref([]);
  // 新增处理方法
  const handleUserSubmit = (users, groupIndex) => {
    selectedUsers.value = users;
    permissionGroups.value[groupIndex].members = selectedUsers.value;
    console.log("selectedUsers", selectedUsers.value);
  };

  // const removeUser = (userToRemove) => {
  //   selectedUsers.value = selectedUsers.value.filter((user) => !(user.id === userToRemove.id && user.type === userToRemove.type));
  // };

  const onFinish = (values) => {
    console.log("Success:", values);
  };
  // 权限选项
  const settingOptin = ref([
    {
      name: "文档置顶",
      value: 1,
    },
    {
      name: "文档分享",
      value: 2,
    },
    {
      name: "文库删除",
      value: 3,
    },
    {
      name: "文库编辑",
      value: 4,
    },
    {
      name: "文库下载",
      value: 5,
    },
    {
      name: "文档排序",
      value: 6,
    },
    {
      name: "文库删除",
      value: 7,
    },
    {
      name: "新建文档",
      value: 8,
    },
    {
      name: "文档下载",
      value: 9,
    },
    {
      name: "文档编辑",
      value: 10,
    },
    {
      name: "文档移动",
      value: 11,
    },
    {
      name: "文档消息设置",
      value: 12,
    },
    {
      name: "文库权限设置",
      value: 13,
    },
    {
      name: "文库消息设置",
      value: 14,
    },
    {
      name: "文档权限设置",
      value: 15,
    },
  ]);
  const checkedList = ref([]);
  const indeterminate = ref(false);
  const checkAll = ref(false);

  const settingTitle = ref("");
  const onCheckAllChange = (e) => {
    checkedList.value = checkAll.value ? [1, 2, 3, 4] : [];
    indeterminate.value = false;
  };
  // const addPerson = () => {
  //   personRef.value.showPersonVisible();
  // };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };
  const indexNav = ref(0);
  const visible = ref(false);
  const placement = ref("right");
  const onClose = () => {
    visible.value = false;
    indexNav.value = 0;
    permissionGroups.value = [
      {
        members: [],
        permissions: [],
      },
    ];
  };

  const id_ = ref("");
  const showDrawer = (item) => {
    console.log(item);
    visible.value = true;

    // settingTitle.value = item.type == "folder" ? "文件夹" : "文档";
    if (item.type == "folder") {
      settingTitle.value = "文件夹";
    } else if (item.type == "file") {
      settingTitle.value = "文档";
    } else {
      settingTitle.value = "文库";
      formState.description = item.description;
    }
    formState.classification_name = item.name || item.classification_name;
    // formState.description = item.description;
    settingNav.value[1].name = settingTitle.value + "权限";
    id_.value = item.id_;

    // 文库的权限具体信息
    getPermissionGroup();
  };

  // 获取文库权限组信息
  const getPermissionGroup = async () => {
    const formData = {
      type: "getWithTreeId",
      classification_tree_id: id_.value,
    };
    const response = await postPermissionApi(qs.stringify(formData));

    if (response.data.success) {
      console.log(response);
      console.log(response.data.obj.permissionMap);
      // settingOptin.value = response.data.obj.permissionMap;
      // console.log(settingOptin.value);
    }
  };

  // 获取权限数据
  const getPermission = async () => {
    const formData = {
      type: "permissionList",
    };
    const response = await postPermissionApi(qs.stringify(formData));

    if (response.data.success) {
      console.log(response);
      // settingOptin.value = response.data.obj.data;
      settingOptin.value = response.data.obj.data.slice(0, 4).map((item) => ({
        ...item,
        name: item.label,
        value: item.number,
      }));
      console.log(settingOptin.value);
    }
  };
  const changeMenu = (index) => {
    indexNav.value = index;
  };

  // 定义事件
  const emit = defineEmits(["updateSuccess"]);
  const saveHandleOk = async () => {
    const formData = {
      type: "update",
      id_: id_.value,
    };
    let response;
    if (settingTitle.value == "文档") {
      formData.file_name = formState.classification_name;
      // 文档更新名称
      response = await postFileapi(qs.stringify(formData)); // 调用接口
    } else {
      formData.classification_name = formState.classification_name;
      // 文件夹更新名称
      response = await postlibraryapi(qs.stringify(formData));
    }
    if (response.data.code == 1) {
      console.log("接口请求成功:", response);
      message.success(response.data.msg);
      appStore.triggerLeftLibraryRefresh(); // 触发文库列表更新
      // 触发事件，传递更新后的数据
      emit("updateSuccess", {
        id_: id_.value,
        name: formState.classification_name,
      });
      libraryformRef.value.resetFields();
      visible.value = false;
    } else {
      message.error("更新失败");
    }
  };
  const clickPermission = async () => {
    console.log("checkedList.value:", checkedList.value);
    const userData = selectedUsers.value.map((item) => item.id).join(",");
    const allOptions = settingOptin.value.map((item) => item.number); // 所有可能的选项

    // 生成结果字符串
    const checkedDataTwo = allOptions.map((option) => (checkedList.value.includes(option) ? "1" : "0")).join("");

    const formData = {
      type: "add",
      classification_tree_id: selectedChildren.value,
      users: userData,
      user_permission: checkedDataTwo,
    };
    console.log(formData);

    // const response = await postPermissionApi(qs.stringify(formData));

    // if (response.data.code == 1) {
    //   console.log("接口请求成功:", response);
    //   message.success("权限设置成功");

    //   visible.value = false;
    // } else {
    //   message.error("更新失败");
    // }
  };

  // 权限组数据结构
  const permissionGroups = ref([
    {
      // id: 1,
      // name: "管理员组",
      members: [],
      permissions: [],
      // editing: false,
      // tempName: "",
    },
  ]);

  // 添加权限组相关
  const addGroupModalVisible = ref(false);
  const newGroupName = ref("");

  // 添加权限组
  const showAddGroupModal = () => {
    // newGroupName.value = "";
    // addGroupModalVisible.value = true;

    permissionGroups.value.push({
      members: [],
      permissions: [],
    });
  };

  // 添加权限组名称弹出框
  const handleAddGroup = () => {
    if (!newGroupName.value.trim()) {
      message.warning("请输入权限组名称");
      return;
    }

    const newId = permissionGroups.value.length > 0 ? Math.max(...permissionGroups.value.map((g) => g.id)) + 1 : 1;

    permissionGroups.value.push({
      id: newId,
      name: newGroupName.value,
      members: [],
      permissions: [],
      editing: false,
      tempName: "",
    });

    message.success("权限组添加成功");
    addGroupModalVisible.value = false;
  };

  // 编辑权限组名称
  const editGroupName = (index) => {
    permissionGroups.value[index].editing = true;
    permissionGroups.value[index].tempName = permissionGroups.value[index].name;
  };

  const saveGroupName = (index) => {
    if (!permissionGroups.value[index].tempName.trim()) {
      message.warning("权限组名称不能为空");
      return;
    }
    permissionGroups.value[index].name = permissionGroups.value[index].tempName;
    permissionGroups.value[index].editing = false;
  };

  // 删除权限组
  const showDeleteConfirm = (index) => {
    Modal.confirm({
      title: "确定要删除这个权限组吗?",
      content: `即将删除权限组: ${permissionGroups.value[index].name}`,
      okText: "确认删除",
      okType: "danger",
      cancelText: "取消",
      onOk() {
        permissionGroups.value.splice(index, 1);
        message.success("权限组已删除");
      },
    });
  };

  // 成员管理
  const addPerson = (groupIndex) => {
    personRef.value.showPersonVisible(groupIndex, permissionGroups.value[groupIndex].members);
  };
  // 删除权限组
  const deletePermissionGroup = (groupIndex) => {
    // 直接从数组中移除
    permissionGroups.value.splice(groupIndex, 1);
  };

  const removeUser = (groupIndex, userId) => {
    const group = permissionGroups.value[groupIndex];
    group.members = group.members.filter((u) => u.id !== userId);
    message.info("成员已移除");
  };

  // 权限选择相关
  const isGroupAllChecked = (groupIndex) => {
    const group = permissionGroups.value[groupIndex];
    return group.permissions.length === settingOptin.value.length;
  };

  const isGroupIndeterminate = (groupIndex) => {
    const group = permissionGroups.value[groupIndex];
    return group.permissions.length > 0 && group.permissions.length < settingOptin.value.length;
  };

  const onGroupCheckAllChange = (e, groupIndex) => {
    permissionGroups.value[groupIndex].permissions = e.target.checked ? settingOptin.value.map((opt) => opt.value) : [];
  };

  // 保存所有权限设置
  const saveAllPermissions = async () => {
    console.log(permissionGroups.value);
    const allOptions = settingOptin.value.map((item) => item.number); // 所有的选项

    // 将人员数组和权限数组分别转换为字符串，通过，连接
    const permissionsData = permissionGroups.value.map((group) => ({
      users: group.members.map((obj) => obj.id).join(","),
      user_permission: allOptions.map((option) => (group.permissions.includes(option) ? "1" : "0")).join(""), //转为2进制
      type: "add",
      classification_tree_id: selectedChildren.value,
    }));

    console.log(permissionsData);
    // const res = await postPermissionApi(qs.stringify(permissionsData));
    // 校验每一项的users和user_permission是否都存在且不为空
    for (let i = 0; i < permissionsData.length; i++) {
      if (!permissionsData[i].users) {
        message.error("请选择人员");
        return;
      }
      if (permissionsData[i].user_permission == "0000") {
        message.error("请勾选权限");
        return;
      }
    }

    // 循环permissionsData，调用接口
    // for (let i = 0; i < permissionsData.length; i++) {
    //   const res = await postPermissionApi(qs.stringify(permissionsData[i]));
    //   console.log(res);
    // }

    // const response = await postPermissionApi(qs.stringify(permissionsData));

    // if (response.data.code == 1) {
    //   console.log("接口请求成功:", response);
    //   message.success("权限设置成功");

    //   visible.value = false;
    // } else {
    //   message.error("更新失败");
    // }
  };

  watch(
    () => checkedList.value,
    (val) => {
      indeterminate.value = !!val.length && val.length < settingOptin.value.length;
      checkAll.value = val.length === settingOptin.value.length;
    }
  );
  defineExpose({
    showDrawer,
  });
</script>

<style scoped>
  .setting-drawer .know-set-body {
    display: flex;
    height: 100%;
    width: 100%;
  }

  .know-set-body .nav-list {
    width: 168px;
    height: 100%;
    background: #f5f6f7;
    padding: 23px 8px 0;
    box-sizing: border-box;
  }

  .know-set-body .nav-body {
    width: calc(100% - 168px);
    height: 100%;
  }

  .nav-content .baseinfo-box,
  .nav-content .auth-box {
    padding: 15px 24px 16px;
  }

  .know-set-body .nav-list .nav-item {
    border-radius: 4px;
    height: 36px;
    display: flex;
    align-items: center;
    font-size: 14px;
    font-family: SourceHanSansCN-Regular;
    color: #363b4c;
    padding: 0 16px;
    box-sizing: border-box;
    cursor: pointer;
  }

  .know-set-body .nav-list .nav-active {
    background: #ddeaff !important;
    color: #1e6fff;
  }

  .know-set-body .nav-list .nav-item + .nav-item {
    margin-top: 14px;
  }

  .setting-drawer .know-set-body .nav-icon {
    width: 16px;
    height: 16px;
    margin-right: 8px;
  }

  .nav-body .nav-title {
    font-size: 17px;
    color: #363b4c;
    padding: 24px 24px 8px;
    font-weight: 600;
  }

  .nav-body .button-box {
    padding: 14px 24px;
  }

  .nav-body .sticky-header {
    position: sticky;
    top: 0;
    margin: 0;
    padding: 16px 0 8px;
    background-color: #fff;
    z-index: 9;
  }

  .auth-box .item-title {
    color: #363b4c;
    font-size: 14px;
    margin-bottom: 8px;
    margin-top: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .nav-body .item-title .title {
    color: #363b4c;
    font-size: 14px;
  }

  .nav-body .item-title .add-auth {
    color: #1e6fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    -webkit-user-select: none;
    user-select: none;
  }

  .permission-content-item + .permission-content-item {
    margin-top: 16px;
  }

  .permission-content-item {
    padding: 16px 16px 16px 21px;
    background-color: #f5f6f7;
    border-radius: 6px;
  }

  .permission-content-item .add-or-del-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .permission-content-item .add-or-del-box .add {
    width: 108px;
    height: 32px;
    background: #e4edff;
    border-radius: 4px;
    color: #1e6fff;
    cursor: pointer;
    font-size: 14px;
    font-family: SourceHanSansCN-Regular;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .permission-content-item .add-or-del-box .del {
    cursor: pointer;
    font-family: SourceHanSansCN-Regular;
    font-size: 14px;
    color: #ff194c;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .permission-content-item .persion-list-box {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    margin-top: 16px;
    grid-column-gap: 16px;
    grid-row-gap: 16px;
  }
  /* 添加样式 */
  .user-item {
    display: flex;
    align-items: center;
    padding: 8px;
    margin: 4px;
    background: #f0f2f5;
    border-radius: 4px;
  }
  .user-item img {
    width: 24px;
    height: 24px;
    margin-right: 8px;
  }
</style>
