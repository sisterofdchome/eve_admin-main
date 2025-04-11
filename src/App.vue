
<template>
  <a-config-provider :locale="locale">
    <router-view/>
  </a-config-provider>
</template>
<script lang="ts" setup>
import { defineComponent, ref, reactive, onMounted, toRefs } from 'vue';
import zhCN from "ant-design-vue/es/locale/zh_CN";
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
const locale = ref(zhCN)
</script>
<style>
	
	.add-type-file .ant-popover-inner{
		width: 380px;
		padding: 0px;
	}
	
	.poperLayTable .ant-popover-inner {
		width: 140px;
		padding: 0px;
	}
	
	.setting-drawer .ant-drawer-body{
		padding: 0 !important;
	}

	::-webkit-scrollbar {
		width: 6px;
		background-color: transparent;
	}

	/*定义滑块
	    内阴影+圆角*/
	/*  鼠标hover的时候才显示滚动条 */
	:hover::-webkit-scrollbar-thumb {
		border-radius: 5px;
		-webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
		background-color: rgba(0, 0, 0, 0.2);
	}
	 
	::-webkit-scrollbar-track {
	    background: unset; 
	}
	 
	::-webkit-scrollbar-thumb:hover {
	    background: #8eb7ff; 
		opacity: 0.3;
	}
</style>