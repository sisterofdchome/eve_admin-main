<template>
  <div class="knowledge-right">
    <div class="el-scrollbar" style="padding-right: 8px">
      <div class="el-scrollbar__wrap el-scrollbar__wrap--hidden-default">
        <div class="el-scrollbar__view" style="">
          <!----><!---->
          <div class="knowledge-right-info-body">
            <div class="info-box">
              <div class="info-color"><img src="../../../assets/libary/cover.png" /></div>
              <div class="info">
                <div class="info-text">
                  <div class="info-desc">
                    <div class="name-type">
                      <div class="name">{{ formState.classification_name }}</div>
                      <!-- <div class="lable user">私有</div> -->
                    </div>
                    <div class="desc"></div>
                  </div>
                  <div class="file-num">
                    <div class="num">
                      文件数：<span>{{ formState.number_files }}</span>
                    </div>
                    <div class="line"></div>
                    <div class="num">
                      创建者：<span>{{ formState.create_name }}</span>
                    </div>
                  </div>
                </div>
                <div class="info-action" @click="settinghandle">
                  <a-button type="primary"><SettingOutlined />文库设置</a-button>
                </div>
              </div>
            </div>
            <div class="view-down-start-box">
              <div class="show-item" style="font-weight: bold">
                <div class="show-title"><EyeOutlined /><span style="margin-left: 4px">浏览数</span></div>
                <div class="show-num">0</div>
              </div>
              <div class="line"></div>
              <div class="show-item" style="font-weight: bold">
                <div class="show-title"><ArrowDownOutlined /><span style="margin-left: 4px">下载数</span></div>
                <div class="show-num">0</div>
              </div>
              <div class="line"></div>
              <div class="show-item" style="font-weight: bold">
                <div class="show-title"><FileZipTwoTone /><span style="margin-left: 4px">文件大小</span></div>
                <div class="show-num">{{ formState.size }}KB</div>
              </div>
            </div>
            <div class="top-file-box">
              <div class="top-title-action">
                <div class="title" style="font-weight: bold">推荐内容</div>
                <div class="view-type-box">
                  <!-- <span class="el-only-child__content el-tooltip__trigger el-tooltip__trigger"></span>
                      <span class="el-only-child__content el-tooltip__trigger el-tooltip__trigger"></span> -->
                </div>
              </div>
              <div class="top-file-map"></div>
              <!---->
              <div><a-empty></a-empty></div>
            </div>
            <div class="update-box">
              <div class="title" style="font-weight: bold">最近更新</div>
              <div class="top-file-list">
                <div class="lists-item lists-items" style="display: flex; align-items: center">
                  <div class="item-name" style="width: 45%">
                    <img src="../../../assets/libary/icon-wjj.png" alt="" height="20px" />
                    <span style="margin-left: 10px">22222</span>
                  </div>
                  <div class="item-author" style="width: 30%"><span class="el-tooltip__trigger">用户5n03vuq</span></div>
                  <div class="item-time" style="width: 20%"><span class="el-tooltip__trigger">2025-04-10 16:25:25</span></div>
                  <div class="bottom-line"></div>
                </div>
                <!---->
              </div>
            </div>
          </div>
          <!---->
        </div>
      </div>
      <div class="el-scrollbar__bar is-horizontal" style="display: none"><div class="el-scrollbar__thumb" style="transform: translateX(0%)"></div></div>
      <div class="el-scrollbar__bar is-vertical" style="display: none"><div class="el-scrollbar__thumb" style="transform: translateY(0%); height: 234.429px"></div></div>
    </div>

    <Setting ref="settingRef" :title="settingTitle" @updateSuccess="handleUpdateSuccess"></Setting>
  </div>
</template>
<script setup>
  import { SettingOutlined, ArrowDownOutlined, EyeOutlined, FileZipTwoTone } from "@ant-design/icons-vue";
  import { ref, onMounted, watch, reactive } from "vue";
  import { defineProps } from "vue";
  import { message } from "ant-design-vue";
  import { postlibraryapi } from "../../../api/index";
  import qs from "qs";

  import { useAppStore } from "../../../store/module/app";
  import { storeToRefs } from "pinia";
  import Setting from "../model/setting.vue";

  const appStore = useAppStore();
  // 引入appStore中的属性
  const { selectedChildren, shouldRefreshLeftTree } = storeToRefs(appStore);

  const props = defineProps({
    id: {
      type: String,
      required: true,
    },
  });

  onMounted(() => {
    getLibraryImformation(props.id);
  });

  const dataList = ref({});
  const formState = reactive({
    classification_name: "",
    number_files: "",
    create_name: "",
    size: "",
    create_time: "",
  });
  // 获取文库信息
  const getLibraryImformation = async (newId) => {
    const formData = {
      type: "get",
      id_: newId,
    };
    const response = await postlibraryapi(qs.stringify(formData));

    if (response.data.obj.error == "") {
      console.log(response);
      dataList.value = response.data.obj.data;
      const { classification_name, number_files, create_name, size, create_time } = response.data.obj.data;
      Object.assign(formState, { classification_name, number_files, create_name, size, create_time });
    }
  };

  const settingRef = ref(null);
  const settingTitle = ref("文库");
  const settinghandle = () => {
    console.log(dataList.value);
    settingRef.value.showDrawer(dataList.value);
  };
  // 监听路由参数变化
  watch(
    () => props.id,
    (newId) => {
      getLibraryImformation(newId);
    }
  );

  // 添加文件后，刷新文库的 KB信息
  watch(shouldRefreshLeftTree, () => {
    getLibraryImformation(props.id); // 刷新
  });
  // 暴露方法给父组件
  defineExpose({
    getLibraryImformation,
  });
</script>
<style scoped>
  .knowledge-right {
    border-left: 1px solid #f5f6f7;
  }
  .el-scrollbar {
    overflow: hidden;
    position: relative;
    height: 100%;
  }
  .el-scrollbar__wrap--hidden-default {
    scrollbar-width: none;
  }
  .el-scrollbar__wrap {
    overflow: auto;
    height: 100%;
  }
  .knowledge-info-page .knowledge-info-body .knowledge-right .el-scrollbar > .el-scrollbar__wrap > .el-scrollbar__view {
    height: 100%;
  }
  .knowledge-right-info-body {
    padding: 0 18px 0 40px;
  }
  .knowledge-right-info-body .info-box {
    display: flex;
  }
  .knowledge-right-info-body .info-box .info-color {
    width: 220px;
    min-width: 220px;
    height: 128px;
    border-radius: 5px;
  }
  .knowledge-right-info-body .info-box .info-color img {
    width: 100%;
    height: 100%;
    border-radius: 5px;
  }
  .knowledge-right-info-body .info-box .info {
    width: calc(100% - 244px);
    display: flex;
    padding-top: 19px;
    margin-left: 24px;
    justify-content: space-between;
  }
  .knowledge-right-info-body .info-box .info .info-text {
    width: calc(100% - 134px);
  }
  .knowledge-right-info-body .view-down-start-box {
    margin-top: 16px;
    width: 100%;
    height: 72px;
    background: #f5f6f7;
    border-radius: 4px;
    padding: 16px 24px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
  }
  .knowledge-right-info-body .view-down-start-box .show-item .show-title {
    color: #6f7588;
    font-size: 14px;
    display: flex;
    align-items: center;
  }
  .knowledge-right-info-body .view-down-start-box .show-item .show-num {
    color: #363b4c;
    font-size: 16px;
    font-family: SourceHanSansCN-Bold !important;
    margin-top: 4px;
  }
  .knowledge-right-info-body .view-down-start-box .line {
    min-width: 1px;
    width: 1px;
    height: 40px;
    background: #eeeff0;
    margin: 0 24px;
  }
  .knowledge-right-info-body .info-box .info .info-text .file-num .line {
    width: 1px;
    height: 16px;
    background: #eeeff0;
    margin: 0 24px;
  }
  .knowledge-right-info-body .top-file-box {
    width: 100%;
    margin-top: 26px;
  }
  .knowledge-right-info-body .top-file-box .top-title-action {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
  }
  .knowledge-right-info-body .top-file-box .top-title-action .title {
    font-size: 20px;
    font-family: SourceHanSansCN-Bold !important;
    color: #363b4c;
  }
  .knowledge-right-info-body .top-file-list {
    border-top: 1px solid #eeeff0;
  }
  .knowledge-right-info-body .update-box {
    margin-top: 24px;
  }
  .el-scrollbar__bar.is-horizontal {
    height: 6px;
    left: 2px;
  }
  .el-scrollbar__bar {
    position: absolute;
    right: 2px;
    bottom: 2px;
    z-index: 1;
    border-radius: 4px;
  }
  .el-scrollbar__bar.is-vertical {
    width: 6px;
    top: 2px;
  }
  .knowledge-right-info-body .info-box .info .info-text .info-desc {
    margin-bottom: 24px;
  }
  .knowledge-right-info-body .info-box .info .info-text .info-desc .name-type {
    display: flex;
    align-items: center;
  }
  .knowledge-right-info-body .info-box .info .info-text .info-desc .name-type .name {
    font-size: 16px;
    color: #494f6a;
    font-family: SourceHanSansCN-Bold !important;
  }
  .knowledge-right-info-body .info-box .info .info-text .file-num {
    display: flex;
    align-items: center;
  }
  .knowledge-right-info-body .info-box .info .info-text .file-num .num {
    color: #6f7588;
    font-size: 14px;
  }
  .knowledge-right-info-body .info-box .info .info-text .file-num .num span {
    color: #363b4c;
  }
  .knowledge-right-info-body .update-box .title {
    margin-bottom: 16px;
    font-size: 20px;
    font-family: SourceHanSansCN-Bold !important;
    color: #363b4c;
  }
  .knowledge-right-info-body .top-file-list {
    border-top: 1px solid #eeeff0;
  }
  .knowledge-right-info-body .top-file-list .lists-items .item-name {
    font-size: 14px;
  }
  .knowledge-right-info-body .top-file-list .lists-item .item-author {
    min-width: 80px;
    font-size: 12px;
    color: #6f7588;
    width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-right: 8px;
    box-sizing: border-box;
  }
  .knowledge-right-info-body .top-file-list .lists-items .item-time {
    font-size: 12px;
    color: #6f7588;
  }
  .knowledge-right-info-body .top-file-list .lists-item .item-time {
    min-width: 80px;
    width: 180px;
    display: flex;
    align-items: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-right: 8px;
    box-sizing: border-box;
  }
  .knowledge-right-info-body .top-file-list .lists-items .bottom-line {
    height: 1px;
    background: #eeeff0;
    position: absolute;
    left: 34px;
    width: calc(100% - 34px);
    bottom: 0;
  }
  .knowledge-right-info-body .top-file-list .lists-item .item-name span {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .knowledge-right-info-body .top-file-list .lists-item .item-author span {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .knowledge-right-info-body .top-file-list .lists-item {
    display: flex;
    align-items: center;
    height: 52px;
    position: relative;
  }
</style>
