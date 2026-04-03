<template>
  <label class="label">{{ node.label }}</label>
  <template v-if="$slots.delete">
    <div class="join">
      <div class="join-item input input-bordered w-full flex items-center">
        <input type="checkbox" class="toggle toggle-primary" v-model="data" />
      </div>
      <slot name="delete" />
    </div>
  </template>
  <template v-else>
    <div class="input input-bordered w-full flex items-center">
      <input type="checkbox" class="toggle toggle-primary" v-model="data" />
    </div>
  </template>
</template>

<script setup lang="ts">
import { isBoolean } from 'lodash-es'

const data = defineModel<any>()
const { node } = defineProps<{ node: ATFNode }>()

watchEffect(() => {
  if (isBoolean(data.value)) return

  data.value = isBoolean(node.default)
    ? node.default
    : false
})
</script>