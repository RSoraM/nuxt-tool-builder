<template>
  <ATFFieldset :legend="node.label">
    <template #append>
      <select class="select select-bordered select-xs" v-model.number="selected_index">
        <option v-for="(branch, index) in branches" :key="index" :value="index">
          {{ branch.label }}
        </option>
      </select>
    </template>

    <template #delete>
      <slot name="delete" />
    </template>

    <template v-if="current_node" v-for="[key, prop] in current_props" :key="`${selected_index}-${key}`">
      <ATFNode :node="prop" v-model="data[key]" />
    </template>
    <ATFNode v-else-if="current_node" :key="selected_index" :node="current_node" v-model="data" />

    <slot />
    <slot name="actions" />
  </ATFFieldset>
</template>

<script setup lang="ts">
import { cloneDeep } from 'lodash-es'
import type { ATFNode } from '#shared/utils/atf'

const modelValue = defineModel<any>()
const { node } = defineProps<{ node: ATFNode }>()

function build_branch_default(branch: ATFNode): any {
  if (branch.template === 'object' && branch.props) {
    return Object.fromEntries(
      Object.entries(branch.props).map(([key, child]) => [key, build_branch_default(child)])
    )
  }
  return branch.default !== undefined ? cloneDeep(branch.default) : undefined
}

function resolve_branch_label(branch: ATFNode, index: number): string {
  if (branch.label) return branch.label
  if (node.discriminator && branch.props?.[node.discriminator]?.default !== undefined) {
    return String(branch.props[node.discriminator]!.default)
  }
  return `选项 ${index + 1}`
}

const unions = node.union || []
const selected_index = ref(0)

// 预初始化所有分支的默认值
const drafts = unions.map(branch => build_branch_default(branch))

// 本地 data ref — 绕过 defineModel SSR 读回问题，同时维持 v-model 引用链
const data = ref<any>(
  modelValue.value !== undefined ? cloneDeep(modelValue.value) : cloneDeep(drafts[0])
)

// data → 父组件同步
watch(data, v => { modelValue.value = v }, { deep: true, immediate: true })

// 分支切换：watch 在 pre-flush 阶段执行，保证先于模板重渲染
watch(selected_index, (newIdx, oldIdx) => {
  drafts[oldIdx] = cloneDeep(data.value)
  data.value = cloneDeep(drafts[newIdx])
})

const current_node = computed(() => {
  const branch = unions[selected_index.value]
  if (!branch || branch.template !== 'object' || !branch.props) return branch
  // 隐藏单值 literal 字段（用户无法修改，select 已标识分支）
  const filtered = Object.fromEntries(
    Object.entries(branch.props).filter(([_, prop]) =>
      !(prop.options && prop.options.length === 1)
    )
  )
  return { ...branch, props: filtered }
})

// object 分支：直接展开 props，避免 Union Fieldset 嵌套 Object Fieldset
const current_props = computed(() =>
  current_node.value?.template === 'object' && current_node.value.props
    ? Object.entries(current_node.value.props)
    : null
)

const branches = computed(() =>
  unions.map((branch, index) => ({
    label: resolve_branch_label(branch, index),
  }))
)
</script>
