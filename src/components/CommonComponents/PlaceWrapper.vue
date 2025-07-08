<template>
    <div :ref="drop" class="relative h-full w-full">
        <!--悬浮样式 -->
        <div
            class="absolute -inset-0.5 border-2 border-dashed hover:border-blue-600 border-transparent z-10 bg-transparent">
            <div id="drag-wrapper-model" class="absolute inset-0 z-10 hover:bg-blue-600 bg-transparent opacity-15">
            </div>
        </div>
        <div class="bg-gray-200 h-full w-full flex items-center justify-center">
            请拖拽组件到此处
        </div>
    </div>
</template>

<script setup lang="ts">
import { useDrop } from 'vue3-dnd';
import type { FormNode, FormNodeTemplate, FormNodeCmpType } from '@/types/index'

const props = defineProps<{
    formNode: FormNodeCmpType
    index: number
}>()

const [, drop] = useDrop(() => ({
    accept: ['FORMNODE', 'INNERFORMNODE'],
    drop: (formNode: FormNodeTemplate | FormNodeCmpType, monitor) => {
        if (monitor.isOver({ shallow: true })) {

        }
    }
}))
</script>

<style scoped></style>
