<template>
  <h1>login view</h1>

  <input v-model="user.account" placeholder="账号" />
  <input v-model="user.password" placeholder="密码" />

  <input v-if="validCode" v-model="user.randCode" placeholder="验证码" />
  <span class="ax-form-img"><img :src="randCodeImage" @click="reloadRandCodeImage" /></span>

  <button @click="submitLogin">登录</button>
</template>

<script lang="ts">
  import { defineComponent, reactive, ref } from "vue";
  // import CryptoJS from "../api/crypto-js.js"
  import CryptoJS from "crypto-js";
  import axios from "axios";
  import { postapi } from "../utils/http";
  import { baseURL } from "../utils/http";
  import { Modal, message } from "ant-design-vue";
  import { useRouter } from "vue-router";

  export default defineComponent({
    name: "LoginForm",
    setup() {
      const user = reactive({
        account: "admin",
        password: "WHkj@2008.com",
        randCode: "",
        rememberMe: 0,
      });

      const ks = ref<{ k: string; iv: string } | null>(null);
      const validCode = ref(true);
      const randCodeImage = ref("");
      const message = ref("");
      const rememberMeChecked = ref(false);
      const router = useRouter();
      const reloadRandCodeImage = async () => {
        try {
          const response = await axios.get(baseURL + `randCodeImage?t=${Date.now()}`, {
            responseType: "blob",
            withCredentials: true, // 加上这个以确保发送 cookie
            sameSite: "none",
          });

          const imageBlob = response.data;
          randCodeImage.value = URL.createObjectURL(imageBlob);
          console.log("刷新验证码地址:", randCodeImage.value);
        } catch (err) {
          console.error("验证码加载失败", err);
        }
      };

      const getKs = async () => {
        //http://localhost:9015/luqiao/supervise/login.v
        try {
          const response = await axios.post(baseURL + "login.v");
          if (response.data) {
            const decoded = atob(response.data); // Base64 解码
            ks.value = JSON.parse(decoded); // 赋值给 ks.value
          } else {
            ks.value = null;
          }
        } catch (error) {
          console.error("获取 ks 失败:", error);
          ks.value = null;
        }
      };

      reloadRandCodeImage();

      const submitLogin = async () => {
        user.rememberMe = rememberMeChecked.value ? 1 : 0;

        if (validCode.value) {
          user.randCode = user.randCode.trim();
          if (!user.randCode) {
            console.log("请输入验证码");
            return;
          }
        }

        await getKs();

        let param: any = {};
        if (ks.value && ks.value.k && ks.value.iv) {
          const key = CryptoJS.enc.Base64.parse(ks.value.k);
          const iv = CryptoJS.enc.Base64.parse(ks.value.iv);
          param.ticket = CryptoJS.MD5(ks.value.k + ks.value.iv).toString();
          param.data = CryptoJS.AES.encrypt(JSON.stringify(user), key, { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }).toString();
        } else {
          param = { ...user };
        }

        const formData = new FormData();
        for (const key in param) {
          formData.append(key, param[key]);
        }

        console.log("最终提交的 formData:");
        for (let [key, val] of formData.entries()) {
          console.log(key, val);
        }

        try {
          const response = await axios.post(baseURL + "login/valid?randCode=" + user.randCode, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
            sameSite: "none",
          });

          const data = response.data;

          if (data.success) {
            // 登录成功处理
            localStorage.setItem("token", data.token);

            const item = {
              url: "",
            };

            router.push({
              path: item.url, // 直接使用配置的 url
              query: {
                id: item.key || "0", // 防止 key 为 undefined
              },
            });
          } else {
            console.error(data.message || "登录失败");
            // ❗ 清空验证码并刷新
            user.randCode = "";
            reloadRandCodeImage();
          }
        } catch (err) {
          console.error("登录接口异常，请稍后重试");
          console.error("登录异常:", err);
        }
      };

      return {
        user,
        validCode,
        rememberMeChecked,
        randCodeImage,
        message,
        submitLogin,
        reloadRandCodeImage,
      };
    },
  });
</script>
