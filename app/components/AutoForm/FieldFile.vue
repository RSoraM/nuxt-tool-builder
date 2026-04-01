<template>
  <label class="label">
    <span class="label-text">{{ node.label }}</span>
  </label>
  <div v-if="$slots.field_action" class="join">
    <input type="file" class="file-input file-input-bordered w-full join-item" :disabled="node.disabled"
      @change="model = ($event.target as HTMLInputElement).files?.[0] ?? null" />
    <slot name="field_action"></slot>
  </div>
  <input v-else type="file" class="file-input file-input-bordered w-full" :disabled="node.disabled"
    @change="model = ($event.target as HTMLInputElement).files?.[0] ?? null" />
</template>

<script setup lang="ts">
const model = defineModel<any>()
defineProps<{ node: ZFPNode }>()
</script>
