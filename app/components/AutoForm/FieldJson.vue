<template>
  <label class="label">
    <span class="label-text">{{ node.label }}</span>
  </label>
  <div v-if="$slots.field_action" class="join">
    <textarea class="textarea w-full join-item" :placeholder="node.placeholder" :autocomplete="node.autoComplete"
      :disabled="node.disabled" v-model="model"></textarea>
    <slot name="field_action"></slot>
  </div>
  <textarea v-else class="textarea w-full" :placeholder="node.placeholder" :autocomplete="node.autoComplete"
    :disabled="node.disabled" v-model="model"></textarea>
</template>

<script setup lang="ts">
const model = defineModel<any>()
defineProps<{ node: ZFPNode }>()
</script>
