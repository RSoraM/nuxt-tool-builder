<template>
  <ATFFieldset :legend="node.label">
    <template #delete>
      <slot name="delete" />
    </template>

    <ATFNode v-for="(child, index) in node.tuple" :key="index" :node="child" v-model="data[index]" />

    <slot />
    <slot name="actions" />
  </ATFFieldset>
</template>

<script setup lang="ts">
import { cloneDeep, isArray } from 'lodash-es'

const data = defineModel<any>()
const { node } = defineProps<{ node: ATFNode }>()

if (!isArray(data.value) || data.value.length !== node.tuple?.length) {
  data.value = isArray(node.default)
    ? cloneDeep(node.default)
    : (node.tuple || []).map(() => undefined)
}
</script>
