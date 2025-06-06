<template>
  <!-- <h1>login view</h1>

  <input v-model="user.account" placeholder="账号" />
  <input v-model="user.password" placeholder="密码" />

  <div v-if="validCode">
    <input v-model="user.randCode" placeholder="验证码" />
    <span class="ax-form-img">
      <img :src="randCodeImage" @click="reloadRandCodeImage" />
    </span>
  </div>

  <button @click="submitLogin">登录</button> -->

  <div class="background">
    <div class="logo">
      <img src="../assets/luqiaologo.png" alt="img" />
      <span>路桥集团业财一体化综合管理系统</span>
    </div>
    <div class="pic">
      <img src="@/assets/icon.svg" alt="img" />
      <h1>输入您的账号密码信息开始使用！</h1>
      <span>内江路桥集团有限公司版权所有</span>
    </div>
    <div class="login-container">
      <h1 style="font-weight: bold">登录</h1>
      <a-tabs class="tab-container" :tabBarGutter="100">
        <a-tab-pane key="1" tab="账号登录">
          <a-form ref="formRef" :model="user" name="basic" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" :rules="rules" autocomplete="off" class="form-container" @keyup.enter="submitLogin">
            <a-form-item name="account">
              <a-input class="form-row" v-model:value="user.account" placeholder="请输入用户名" />
            </a-form-item>

            <a-form-item name="password">
              <a-input-password class="form-row" v-model:value="user.password" placeholder="请输入密码" />
            </a-form-item>

            <a-form-item class="verify-container" name="randCode">
              <a-input class="verify" v-model:value="user.randCode" placeholder="请输入验证码" />
              <div class="login-code">
                <img :src="randCodeImage" class="login-code-img" @click="reloadRandCodeImage" />
              </div>
            </a-form-item>
            <div class="form-row">
              <a-button type="primary" @click="submitLogin" @keyup.enter="submitLogin" :loading="iconLoading">登录</a-button>
            </div>
          </a-form>
        </a-tab-pane>
        <a-tab-pane key="2" tab="微信小程序" force-render>
          <div class="app">
            <img src="@/assets/vxcode.png" style="border: unset" />
            <span>微信扫一扫</span>
          </div>
        </a-tab-pane>
        <!-- <a-tab-pane key="3" tab="APP下载">
          <div class="app">
            <img src="@/assets/appcode.png" />
            <span>安卓APP下载</span>
          </div>
        </a-tab-pane> -->
      </a-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from "vue";
  import CryptoJS from "crypto-js";
  import axios from "axios";
  import { useRouter } from "vue-router";
  import { baseURL } from "../utils/http";
  import { message } from "ant-design-vue";

  const formRef = ref();
  const rules = {
    account: [
      {
        required: true,
        message: "请输入用户名！",
      },
    ],
    password: [
      {
        required: true,
        message: "请输入密码!",
      },
    ],
    randCode: [
      {
        required: true,
        message: "请输入验证码!",
      },
    ],
  };

  // 表单数据
  const user = reactive({
    account: "admin",
    password: "WHkj@2008.com",
    randCode: "",
    rememberMe: 0,
  });

  // 状态
  const validCode = ref(true);
  const randCodeImage = ref("");
  const rememberMeChecked = ref(false);
  const ks = ref<{ k: string; iv: string } | null>(null);

  const router = useRouter();

  // 刷新验证码图片
  const reloadRandCodeImage = async () => {
    try {
      const response = await axios.get(`${baseURL}randCodeImage?t=${Date.now()}`, {
        responseType: "blob",
        withCredentials: true,
      });
      randCodeImage.value = URL.createObjectURL(response.data);
      console.log("刷新验证码地址:", randCodeImage.value);
    } catch (err) {
      console.error("验证码加载失败", err);
    }
  };

  // 获取 ks（加密 key 和 iv）
  const getKs = async () => {
    try {
      const response = await axios.post(`${baseURL}login.v`);
      if (response.data) {
        const decoded = atob(response.data);
        ks.value = JSON.parse(decoded);
      } else {
        ks.value = null;
      }
    } catch (error) {
      console.error("获取 ks 失败:", error);
      ks.value = null;
    }
  };
  const iconLoading = ref(false);

  // 登录提交
  const submitLogin = async () => {
    user.rememberMe = rememberMeChecked.value ? 1 : 0;

    // if (validCode.value) {
    //   user.randCode = user.randCode.trim();
    //   if (!user.randCode) {
    //     console.warn("请输入验证码");
    //     return;
    //   }
    // }
    formRef.value.validate().then(async () => {
      await getKs();

      let param: any = {};
      if (ks.value?.k && ks.value?.iv) {
        const key = CryptoJS.enc.Base64.parse(ks.value.k);
        const iv = CryptoJS.enc.Base64.parse(ks.value.iv);
        param.ticket = CryptoJS.MD5(ks.value.k + ks.value.iv).toString();
        param.data = CryptoJS.AES.encrypt(JSON.stringify(user), key, {
          iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        }).toString();
      } else {
        param = { ...user };
      }

      const formData = new FormData();
      for (const key in param) {
        formData.append(key, param[key]);
      }

      iconLoading.value = {
        delay: 0,
      };
      setTimeout(() => {
        iconLoading.value = false;
      }, 1000);
      try {
        const response = await axios.post(`${baseURL}login/valid?randCode=${user.randCode}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        });

        const data = response.data;
        if (data.success) {
          message.success("登录成功！");
          localStorage.setItem("token", data.token);
          setTimeout(function () {
            router.push("/");
          }, 500);
        } else {
          console.error(data.message || "登录失败");
          message.error(data.message || "登录失败");
          user.randCode = "";
          reloadRandCodeImage();
        }
      } catch (err) {
        console.error("登录接口异常:", err);
      }
    });
  };

  // 组件挂载时加载验证码
  onMounted(() => {
    reloadRandCodeImage();
  });
</script>

<style scoped>
  .background {
    z-index: 0;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    position: absolute;
    background-image: url("../assets/background.png");
    min-height: 100vh;
    overflow: hidden;
    top: 0;
    left: 0;
    width: 100%;
  }

  .logo {
    animation: animationLeft 0.7s ease-out;
  }

  .logo span {
    color: white;
    font-size: 24px;
    font-weight: 700;
    line-height: normal;
    width: 60%;
    height: 80px;
    margin: 2.5rem 0 0 0.5rem;
    position: absolute;
  }

  .logo img {
    z-index: 1;
    background-position: left;
    background-repeat: no-repeat;
    width: 48px;
    margin-left: 6.5rem;
    transform: translateY(110%);
  }

  .pic {
    flex-direction: column;
    align-items: start;
    margin-left: 10%;
    /* margin-top: 13%; */
    position: absolute;
    animation: animationLeft 0.5s ease-out;
    bottom: 35%;
    top: 35%;
  }

  .pic img {
    z-index: 1;
    margin-bottom: 20px;
    width: 40%;
  }

  .pic h1 {
    color: white;
    font-size: 1.5rem;
    line-height: 2.25rem;
    font-weight: 700;
  }

  .pic span {
    color: white;
    font-size: 1rem;
    line-height: 2.25rem;
    margin-top: 20px;
    margin-left: 3px;
    z-index: 1;
    display: flex;
    font-weight: 500;
    line-height: normal;
  }

  .login-container {
    z-index: 3;
    color: black;
    flex-direction: column;
    position: absolute;
    margin-left: 60%;
    bottom: 24%;
    top: 24%;
    opacity: 1;
    animation: animationRight 0.5s ease-out;
    box-sizing: border-box;
    border-radius: 8px;
  }

  .login-container h1 {
    transform: translateX(-5%);
  }

  .form-container {
    margin: 10px 0 0 0;
    border-radius: 8px;
  }

  .verify-container {
    min-height: 50px;
    width: 400px;
    border-radius: 8px;
  }

  .verify {
    width: 100%;
    margin-bottom: -40px;
    border-radius: 8px;
    height: 40px;
    margin-top: 5px;
    display: flex;
  }

  .verify-container img {
    cursor: pointer;
    height: 40px;
    transform: translate(80%, 0%);
  }

  .form-row {
    display: flex;
    margin-top: 5px;
    height: 40px;
    width: 394px;
    border-radius: 8px;
  }

  .form-row input,
  .form-row input password {
    flex: 1;
    width: 200px;
    border: 1px solid #ccc;
    font-size: 14px;
    border-radius: 8px;
  }

  .form-row input:hover,
  .form-row input:focus {
    border-color: blue;
    outline: none;
  }

  .form-row button {
    flex: 1;
    width: 100%;
    border-radius: 8px;
    cursor: pointer;
    border: 1px solid #ccc;
    background-color: rgb(32, 110, 236);
    color: white;
    padding: 5px;
    font-size: 16px;
    margin-top: 1px;
    height: 35px;
    box-sizing: initial;
  }

  .form-row button:hover {
    background-color: rgb(73, 130, 221);
  }

  .remember-forget {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 0 15px 10px;
    min-width: 100%;
    width: 100%;
    box-sizing: border-box;
  }

  .remember-forget span {
    border: none;
    background: none;
    color: rgb(22, 108, 237);
    cursor: pointer;
    margin-left: 270px;
    flex: auto;
  }

  .button-container {
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-top: 20px;
  }

  .button-container button {
    width: 120px;
    border-radius: 8px;
    cursor: pointer;
    border: 1px solid #ccc;
    background-color: white;
    padding: 6px 12px;
  }

  .app img {
    width: 150px;
    margin-left: 120px;
    padding-top: 20px;
    display: block;
  }

  .app span {
    display: block;
    padding-top: 20px;
    margin-left: 155px;
  }

  .tab-container {
    height: 30rem;
    width: 100%;
  }

  .ant-message {
    margin: 50% !important;
  }

  @media (max-width: 1200px) {
    .logo {
      margin: -1.5rem 0 0 -5rem;
    }

    .background {
      background-image: none;
      background-color: rgb(51, 51, 97);
    }

    .login-container {
      width: 450px;
      height: 420px;
      position: absolute;
      left: 50%;
      top: 50%;
      margin-left: -220px;
      margin-top: -220px;
      border: 1px solid white;
      background-color: white;
      padding-left: 20px;
    }

    .login-container h1 {
      transform: translate(40%);
    }

    .pic {
      display: none;
    }

    .form-row {
      align-items: center;
      justify-content: center;
    }

    .form-row button {
      align-items: center;
      justify-content: center;
    }

    .tab-container {
      transform: translateX(2%);
    }
  }

  @keyframes animationLeft {
    0% {
      opacity: 0;
      transform: translateX(-100%);
    }

    100% {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes animationRight {
    0% {
      opacity: 0;
      transform: translateX(100%);
    }

    100% {
      opacity: 1;
      transform: translateX(0);
    }
  }
  .login-code {
    width: 33%;
    height: 40px;
    float: right;

    img {
      cursor: pointer;
      vertical-align: middle;
    }
  }
  .login-code-img {
    height: 40px;
    padding-left: 12px;
  }
</style>
