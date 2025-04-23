<template>
  <h1>login view</h1>

  <span class="ax-form-img"><img :src="randCodeImage" @click="reloadRandCodeImage"/></span>

  <button :disabled="loading" @click="submitLogin">
    <span v-if="loading" class="fa fa-spinner fa-spin"></span>
    登录
  </button>
</template>


<script lang="ts">
import {defineComponent, reactive, ref} from 'vue'
// import CryptoJS from "../api/crypto-js.js"
import CryptoJS from "crypto-js";
import axios from "axios";
import {postapi} from "../utils/http";
import {baseURL} from "../utils/http";
import { Modal, message } from "ant-design-vue";

export default defineComponent({
  name: 'LoginForm',
  setup() {
    const user = reactive({
      username: 'admin',
      password: 'WHkj@2008.com',
      rememberMe: 0,
      randCode: ''
    })

    const ks = ref<{ k: string, iv: string } | null>(null)
    const validCode = ref(false)
    const loading = ref(false)
    const randCodeImage = ref('')
    const message = ref('')
    const rememberMeChecked = ref(false)


// 验证码刷新函数
    const reloadRandCodeImage = () => {
      randCodeImage.value = baseURL+`captcha?${new Date().getTime()}`
      console.log(randCodeImage.value)
    }
    reloadRandCodeImage()

// 可替换为其他刷新逻辑
    const getinfo = () => {
      // 获取额外登录信息的函数，比如用户安全级别、验证码模式等
    }

// 登录提交函数
    const submitLogin = async () => {
      if (loading.value) return
      loading.value = true
      user.rememberMe = rememberMeChecked.value ? 1 : 0

      // 有验证码时先处理
      if (validCode.value) {
        user.randCode = user.randCode.trim()
      }

      let param: any = {}
      if (ks.value && ks.value.k && ks.value.iv) {
        const key = CryptoJS.enc.Base64.parse(ks.value.k)
        const iv = CryptoJS.enc.Base64.parse(ks.value.iv)
        param.ticket = CryptoJS.MD5(ks.value.k + ks.value.iv).toString()
        param.data = CryptoJS.AES.encrypt(
            JSON.stringify(user),
            key,
            {iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7}
        ).toString()
      } else {
        param = {...user}
      }

      try {
        const {data} = await postapi('/login/valid', param)
        loading.value = false

        if (data.success) {
          localStorage.setItem('token', data.token)
          window.location.href = '/main/home'
        } else {
          if (data.message.includes('passwordExpired')) {
            const expiredMessage = data.message.replace('passwordExpired-', '')
            alert(`密码过期：${expiredMessage}`)
            window.location.href = `/main/passwordExpired?userId=${data.username}`
          } else {
            reloadRandCodeImage()
            getinfo()
            user.randCode = ''
            console.log(data.message)
          }
        }
      } catch (err) {
        loading.value = false
        console.log('请求失败，请稍后再试。')
      }
    }

    return {
      user,
      loading,
      validCode,
      rememberMeChecked,
      randCodeImage,
      message,
      submitLogin,
      reloadRandCodeImage
    }
  }
})
</script>
