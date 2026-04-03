<template>
  <template v-if="$slots.delete">
    <div class="w-full flex items-center justify-between">
      <label class="label">{{ node.label }}</label>
      <input type="checkbox" class="toggle" v-model="data" />
      <slot name="delete" />
    </div>
  </template>
  <template v-else>
    <div class="w-full flex items-center justify-between">
      <label class="label">{{ node.label }}</label>
      <input type="checkbox" class="toggle" v-model="data" />
    </div>
  </template>
</template>

<script setup lang="ts">
import { isBoolean } from 'lodash-es'

const data = defineModel<any>()
const { node } = defineProps<{ node: ATFNode }>()

if (!isBoolean(data.value)) {
  data.value = isBoolean(node.default)
    ? node.default
    : false
}
</script>