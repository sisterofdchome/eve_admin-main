<template>
  <svg :style="{ width, height }">
    <use :xlink:href="prefix + name" :fill="color"></use>
  </svg>
</template>

<script setup>
defineProps({
  // 是否显示
  prefix: {
    type: String,
    default: '#icon-',
  },
  name: String,
  color: {
    type: String,
    default: '#10aa34',
  },
  width: {
    type: String,
    default: '14px',
  },
  height: {
    type: String,
    default: '14px',
  },

})
</script>

<style lang='scss' scoped></style>
