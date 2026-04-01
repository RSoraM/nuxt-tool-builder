<template>
  <label class="label">
    <span class="label-text">{{ node.label }}</span>
  </label>
  <div v-if="$slots.field_action" class="join">
    <input type="number" class="input input-bordered w-full join-item" :placeholder="node.placeholder"
      :autocomplete="node.autoComplete" :disabled="node.disabled" v-model.number="model" />
    <slot name="field_action"></slot>
  </div>
  <input v-else type="number" class="input input-bordered w-full" :placeholder="node.placeholder"
    :autocomplete="node.autoComplete" :disabled="node.disabled" v-model.number="model" />
</template>

<script setup lang="ts">
const model = defineModel<any>()
defineProps<{ node: ZFPNode }>()
</script>
