<template>
  <div id="panel-tabs" class="flex flex-col items-center gap-2 py-4 w-10">
    <el-tooltip effect="dark" content="大纲树" placement="right">
      <ScaleToOriginal class="w-6 h-6  cursor-pointer"
        :class="[{ 'text-[var(--color-icon-default)]': currentPanel !== 'ScaleToOriginal' }, { 'text-blue-500': currentPanel === 'ScaleToOriginal' }]"
        @click="currentPanel = 'ScaleToOriginal'" />
    </el-tooltip>
    <el-tooltip effect="dark" content="组件" placement="right">
      <Menu class="w-6 h-6 cursor-pointer"
        :class="[{ 'text-[var(--color-icon-default)]': currentPanel !== 'ComponentPanel' }, { 'text-blue-500': currentPanel === 'ComponentPanel' }]"
        @click="currentPanel = 'ComponentPanel'" />
    </el-tooltip>
  </div>
  <ComponentPanel />
</template>

<script setup lang="ts">
import { ref } from 'vue';

const currentPanel = ref('ComponentPanel')


</script>

<style scoped>
#panel-tabs {
  background-color: var(--color-bg-tertiary);
  border-right: 1px solid var(--color-border-base);
  color: var(--color-icon-default);
}
</style>
