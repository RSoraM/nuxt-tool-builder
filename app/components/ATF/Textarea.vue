<template>
  <label class="label">{{ node.label }}</label>
  <template v-if="$slots.delete">
    <div class="join join-vertical">
      <slot name="delete" />
      <textarea class="textarea textarea-bordered w-full join-item" rows="4" v-model="data"></textarea>
    </div>
  </template>
  <template v-else>
    <textarea class="textarea textarea-bordered w-full" rows="4" v-model="data"></textarea>
  </template>
</template>

<script setup lang="ts">
import { isString } from 'lodash-es'

const data = defineModel<any>()
const { node } = defineProps<{ node: ATFNode }>()

if (!isString(data.value)) {
  data.value = isString(node.default)
    ? node.default
    : ''
}
</script>
