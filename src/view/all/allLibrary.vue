<template>
  <div class="library-list">
    <template v-for="group in libraryData" :key="group.title">
      <a-list :header="group.title" :data-source="group.items" size="small" bordered>
        <template #renderItem="{ item }">
          <a-list-item class="list-item">
            {{ item }}
            <template #actions>
              <eye-outlined />
              <!-- 只读图标 -->
            </template>
          </a-list-item>
        </template>
      </a-list>
      <a-divider class="divider" />
    </template>
  </div>
</template>

<script setup>
  import { EyeOutlined } from "@ant-design/icons-vue";
  import { ref, reactive, onMounted } from "vue";

  const libraryData = [
    {
      title: "全部文库",
      items: ["11111", "111111", "test001"],
    },
    {
      title: "S01",
      items: ["房间", "建筑"],
    },
    {
      title: "C5",
      items: ["语音部", "文档效果"],
    },
  ];
</script>

<style scoped>
  .divider {
    margin: 12px 0;
  }
  .list-item {
    padding-left: 24px;
  }
</style>
