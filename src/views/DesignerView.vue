<template>
  <!-- 确定宽高数值和定位 -->
  <div colorTransition id="designer-view" class="w-screen h-screen flex flex-col">
    <header class="w-full h-14">
      <Topbar />
    </header>
    <main class="w-full flex justify-between gap-7 flex-auto">
      <div id="left-area" class="w-[425px] flex h-full min-w-0 shrink">
        <PanelTabs />
        <ComponentPanel />
      </div>
      <div id="center-area" class="w-[660px] flex flex-col justify-between shrink-0 h-full">
        <!-- 顶部工具栏组件 -->
        <Toolbar />
        <!-- 画布组件 -->
        <DesignCanvas />
      </div>
      <div id="right-area" class="w-[400px] flex h-full min-w-0 shrink">
        <PropertyPanel />
      </div>
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
