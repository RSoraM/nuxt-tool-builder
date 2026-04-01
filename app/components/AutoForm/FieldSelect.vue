<template>
  <label class="label">
    <span class="label-text">{{ node.label }}</span>
  </label>
  <div v-if="$slots.field_action" class="join">
    <select class="select select-bordered w-full join-item" :disabled="node.disabled" v-model="model">
      <option v-for="option in node.options || []" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <slot name="field_action"></slot>
  </div>
  <select v-else class="select select-bordered w-full" :disabled="node.disabled" v-model="model">
    <option v-for="option in node.options || []" :key="option.value" :value="option.value">
      {{ option.label }}
    </option>
  </select>
</template>

<script setup lang="ts">
const model = defineModel<any>()
defineProps<{ node: ZFPNode }>()
</script>
