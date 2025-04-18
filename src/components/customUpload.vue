<template>
  <div>
    <a-upload v-model:file-list="fileList" :custom-request="customRequest" multiple>
      <a-button type="primary"> 上传 </a-button>
      <template #itemRender="{ file, actions }">
        <div class="ant-file-box">
          <div class="ant-item-thumbnail flex">
            <a class="fa fa-file-o"></a>
          </div>
          <div class="ant-file-name">
            <div @click="previewFile(file)" :style="file.status === 'error' ? 'color: red' : ''">{{ file.name }}</div>
            <a-progress v-if="file.status == 'uploading'" :percent="percent[file.uid]" size="small"></a-progress>
          </div>
          <div class="flex">
            <a href="javascript:;" @click="down(file)" style="padding: 0 12px">下载</a>
            <a href="javascript:;" @click="delFile(file)">
              <!-- <icon class="fa fa-times"></icon> -->
              X
            </a>
          </div>
        </div>
      </template>
    </a-upload>
  </div>
</template>

<script>
  import axios from "axios";
  export default {
    data() {
      return {
        fileList: [], // 文件列表
        source: {}, // 取消上传的source
        percent: {}, // 上传进度百分比
        showOperate: {}, // 是否显示操作按钮
        data: "",
      };
    },
    mounted() {
      console.log(this.value);
      if (this.value != "") {
        this.data = JSON.parse(this.value);
        this.initData();
      }
    },
    methods: {
      /**
       * @param {Object} e
       *
       */
      initData() {
        this.fileList = [];
        this.data.forEach((item) => {
          this.fileList.push({
            uid: item.id,
            name: item.name,
            fileId: item.id,
            size: item.size,
            status: "done",
          });
        });
      },

      // 自定义上传请求
      customRequest(e) {
        const formData = new FormData();
        formData.append("file", e.file);
        this.source[e.file.uid] = axios.CancelToken.source();

        axios
          .post(`/luqiao/system/file/fileUpload?code=&biz_type=CLOUD_DISK`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              // Authorization:
              //   "Bearer " +
              //   "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImF1ZCI6Im1vYmlsZSIsIm1hbmFnZU9yZyI6IjEwMDAwMDE3NjY0NDMwIiwiZXhwIjoxNzQ0NzkwMjg2LCJpYXQiOjE3NDQ3NjUwODZ9.VemHV94mEA3SVoDoZuzi49534CnfuRTzOZw1-c1vDIhhU9xPImWbyfpu8RE8NPFiAQdOhjFSQaCJFLr93x_avg",
            },

            onUploadProgress: (progressEvent) => {
              // 上传进度
              // 计算上传进度百分比
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              this.percent[e.file.uid] = percentCompleted;
              console.log(`上传进度: ${percentCompleted}%`);
            },
            cancelToken: this.source[e.file.uid].token,
            // timeout: 0,
          })
          .then((res) => {
            this.fileList.forEach((item) => {
              if (item.uid == e.file.uid) {
                item.fileId = res.data.fileId;
                item.status = "done";
              }
            });
            this.dataDisplay();
          })
          .catch((err) => {
            console.log(err);
            this.fileList.forEach((item) => {
              if (item.uid == e.file.uid) {
                item.status = "error";
              }
            });
          });
      },
      /**
       * 删除文件
       * @param {Object} e
       */
      delFile(e) {
        if (this.source[e.uid]) {
          this.source[e.uid].cancel();
        }
        this.fileList = this.fileList.filter((item) => item.uid != e.uid);
        this.dataDisplay();
      },
      /**
       * 数据回显
       */
      dataDisplay() {
        var file = [];
        console.log(this.fileList);
        this.fileList.forEach((item) => {
          file.push({
            id: item.fileId,
            name: item.name,
            size: item.size,
          });
        });
        this.$emit("display", {
          name: this.name,
          value: file.length == 0 ? "" : JSON.stringify(file),
        });
      },
      /**
       *下载文件
       * @param {Object} e
       */
      down(e) {
        var param = {
          code: e.fileId,
          sf: "1",
        };
        downloadFile(param).then((res) => {
          console.log(res);
          Vue.prototype.$message({
            message: "1232",
            type: "error",
          });
          if (res.result) {
            window.location.href = axios.defaults.baseURL + "/jxload/view.pdf?code=" + res.message;
          } else {
            Vue.prototype.$message({
              message: res.data.msg,
              type: "error",
            });
          }
        });
      },
      /**
       * 预览文件
       */
      previewFile(e) {
        preview_office(e.fileId, e.name, false);
      },
    },
    props: ["value", "name", "permission"],
  };
</script>

<style scoped>
  .ant-file-box {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  file-item span.error {
    color: red;
  }

  .ant-file-box {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    height: 66px;
    padding: 8px;
    border: 1px solid #d9d9d9;
    border-radius: 2px;
    margin-top: 8px;
    font-size: 14px;
  }

  .ant-file-item {
    display: flex;
    align-items: center;
    width: 100%;
  }

  .ant-item-thumbnail {
    width: 48px;
    height: 48px;
    line-height: 48px;
    text-align: center;
    opacity: 0.8;
    font-size: 24px;
  }

  .ant-item-thumbnail > a {
    color: #656565;
  }

  .ant-file-name {
    flex: auto;
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    transition: all 0.3s;
    cursor: pointer;
  }

  .ant-file-name > div:first-child {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .ant-select-tree-switcher,
  .ant-modal-close-x {
    display: list-item;
  }
  th,
  th {
    font-size: 14px;
  }

  .flex {
    flex: none;
  }
</style>
