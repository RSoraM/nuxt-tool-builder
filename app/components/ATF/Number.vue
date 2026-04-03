<template>
  <label class="label">{{ node.label }}</label>
  <template v-if="$slots.delete">
    <div class="join">
      <input type="number" step="any" class="input input-bordered w-full join-item" v-model.number="data" />
      <slot name="delete" />
    </div>
  </template>
  <template v-else>
    <input type="number" step="any" class="input input-bordered w-full" v-model.number="data" />
  </template>
</template>

<script setup lang="ts">
import { isNumber } from 'lodash-es'

const data = defineModel<any>()
const { node } = defineProps<{ node: ATFNode }>()

const isValidNumber = (value: unknown): value is number => isNumber(value) && !Number.isNaN(value)

watchEffect(() => {
  if (isValidNumber(data.value)) return

  data.value = isValidNumber(node.default)
    ? node.default
    : 0
})
</script>