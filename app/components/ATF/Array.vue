<template>
  <ATFFieldset :legend="node.label">
    <template #append>
      <button class="btn btn-primary btn-xs" @click="data.push(node.element?.default)">
        添加
      </button>
    </template>

    <template #delete>
      <slot name="delete" />
    </template>

    <template v-for="(_, index) in data">
      <ATFNode :node="node.element!" v-model="data[index]">
        <template #delete>
          <button class="btn btn-error"
            :class="!primitive_templates.includes(node.element!.template) ? 'btn-xs' : 'join-item'"
            @click="data.splice(index, 1)">
            删除
          </button>
        </template>
      </ATFNode>
    </template>

    <slot />
    <slot name="actions" />
  </ATFFieldset>
</template>

<script setup lang="ts">
import { isArray } from 'lodash-es'

const data = defineModel<any>()
const { node } = defineProps<{ node: ATFNode }>()

onMounted(() => {
  data.value = isArray(data.value)
    ? data.value
    : isArray(node.default)
      ? node.default
      : []
})
</script>