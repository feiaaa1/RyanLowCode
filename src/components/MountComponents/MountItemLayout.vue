<template>
    <div class="relative h-full w-full">
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
<script setup lang="tsx">
import { computed } from 'vue'
import type { FormNodeCmpType } from '@/types/index'
const props = defineProps<{
    configs: Record<string, any>,
    children: FormNodeCmpType[],
}>()
defineOptions({
    type: "layoutItem",
    nodeName: "布局",
    nodeType: ["NESTED", "NODRAG"],

    // 自定义属性面板结构与节点接收的所有可配置内容
    configPanelList: {
        props: [

        ],

        validate: [{}],

        style: [{
            prop: "width",
            defaultValue: "660px",
            type: "input",
            label: "宽度"
        },
        {
            prop: "height",
            defaultValue: "300px",
            type: "input",
            label: "高度"
        },
        {
            prop: 'display',
            defaultValue: 'flex',
            type: 'select',
            label: '布局方式',
            options: [
                {
                    label: 'flex',
                    value: 'flex'
                },
                {
                    label: 'grid',
                    value: 'grid'
                }
            ]
        },
        {
            prop: 'justify-content',
            defaultValue: 'space-between',
            type: 'select',
            label: '水平对齐',
            options: [{
                label: 'flex-start',
                value: 'flex-start'
            },
            {
                label: 'flex-end',
                value: 'flex-end'
            },
            {
                label: 'center',
                value: 'center'
            },
            {
                label: 'space-between',
                value: 'space-between'
            },
            {
                label: 'space-around',
                value: 'space-around'
            },
            {
                label: 'space-evenly',
                value: 'space-evenly'
            }]
        },
        {
            prop: 'align-items',
            defaultValue: 'center',
            type: 'select',
            label: '垂直对齐',
            options: [{
                label: 'flex-start',
                value: 'flex-start'
            },
            {
                label: 'flex-end',
                value: 'flex-end'
            },
            {
                label: 'center',
                value: 'center'
            },
            {
                label: 'baseline',
                value: 'baseline'
            },
            {
                label: 'stretch',
                value: 'stretch'
            }]
        },
        {
            prop: "gap",
            defaultValue: "10px",
            type: "input",
            label: "间距"
        },
        {
            prop: "margin",
            defaultValue: "0",
            type: "input",
            label: "外边距"
        },
        {
            prop: "padding",
            defaultValue: "20px",
            type: "input",
            label: "内边距"
        }
        ],


    },

})
const _props = computed(() => {
    return props.configs.props
})
const validate = computed(() => {
    return props.configs.validate
})
const style = computed(() => {
    return props.configs.style
})

</script>
<style scoped></style>