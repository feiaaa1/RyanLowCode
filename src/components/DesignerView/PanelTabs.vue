<template>
  <div id="panel-tabs" class="flex flex-col items-center text-red-500 w-10">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="size-6"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
      />
    </svg>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
#panel-tabs {
  background-color: var(--color-bg-tertiary);
  border-right: 1px solid var(--color-border-base);
}
</style>
