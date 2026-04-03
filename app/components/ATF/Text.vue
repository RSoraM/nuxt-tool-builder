<template>
  <label class="label">{{ node.label }}</label>
  <template v-if="$slots.delete">
    <div class="join">
      <input type="text" class="input input-bordered w-full join-item" v-model="data" />
      <slot name="delete" />
    </div>
  </template>
  <template v-else>
    <input type="text" class="input input-bordered w-full" v-model="data" />
  </template>
</template>

<script setup lang="ts">
import { isString } from 'lodash-es'

const data = defineModel<any>()
const { node } = defineProps<{ node: ATFNode }>()

onMounted(() => {
  if (isString(data.value)) return

  data.value = isString(node.default)
    ? node.default
    : ''
})
</script>