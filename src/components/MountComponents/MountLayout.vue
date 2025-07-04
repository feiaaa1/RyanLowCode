<template>
    <div id="outer-container" class="border-2 border-gray-200" :style="style">
        <!-- <DragWrapper> -->
        <div class="h-full w-full " id="inner-container" v-for="(item, index) in Number(_props.cloumn)" :key="index">

            <template v-if="props.children[index]">
                <!-- <el-form ref="form" label-width="80px"> -->
                <DragWrapper :formNode="props.children[index]">
                    <component :is="props?.children[index]?.type" :configs="props?.children[index]?.configs">
                    </component>
                </DragWrapper>
                <!-- </el-form> -->
            </template>
            <template v-else>
                <div class="bg-gray-200 h-full w-full flex items-center justify-center">
                    请拖拽组件到此处
                </div>
            </template>
        </div>
        <!-- </DragWrapper> -->
    </div>
</template>

<script setup lang="tsx">
import { computed } from 'vue'
import type { FormNodeCmpType } from '@/types/index'
import DragWrapper from '@/components/CommonComponents/DragWrapper.vue'
const props = defineProps<{
    configs: Record<string, any>,
    children: FormNodeCmpType[],
}>()
defineOptions({
    type: "layout",
    nodeName: "布局容器",
    nodeType: "NESTED",

    // 自定义属性面板结构与节点接收的所有可配置内容
    configPanelList: {
        props: [
            {
                prop: "cloumn",
                defaultValue: 3,
                type: "input",
                label: "列数"
            }
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