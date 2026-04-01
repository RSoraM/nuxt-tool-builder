<template>
  <label class="cursor-pointer label justify-between">
    <span class="label-text">{{ node.label }}</span>
    <div v-if="$slots.field_action" class="flex gap-2 items-center">
      <input type="checkbox" class="toggle" :disabled="node.disabled" v-model="model" />
      <slot name="field_action"></slot>
    </div>
    <input v-else type="checkbox" class="toggle" :disabled="node.disabled" v-model="model" />
  </label>
</template>

<script setup lang="ts">
const model = defineModel<any>()
defineProps<{ node: ZFPNode }>()
</script>
