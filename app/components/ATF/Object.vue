<template>
  <ATFFieldset :legend="node.label">
    <template #delete>
      <slot name="delete" />
    </template>

    <ATFNode v-for="[key, value] in Object.entries(node.props || {})" :key="key" :node="value" v-model="data[key]" />

    <slot />
    <slot name="actions" />
  </ATFFieldset>
</template>

<script setup lang="ts">
import { isObject } from 'lodash-es'

const data = defineModel<any>()
const { node } = defineProps<{ node: ATFNode }>()

data.value = isObject(data.value)
  ? data.value
  : isObject(node.default)
    ? node.default
    : {}
</script>