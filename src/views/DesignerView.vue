<template>
  <!-- 确定宽高数值和定位 -->
  <div
    colorTransition
    id="designer-view"
    class="w-screen h-screen flex flex-col"
  >
    <header class="h-14">
      <TopToolbar />
    </header>
    <main class="flex flex-auto">
      <PanelTabs />
      <ComponentPanel />
      <DesignCanvas />
    </main>
  </div>
</template>

<script setup lang="ts">
</script>

<style lang="scss" scoped>
#designer-view {
  background-color: var(--color-bg-base);
  position: relative;
}
</style>
