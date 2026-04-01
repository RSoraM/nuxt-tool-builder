<template>
  <label class="label">
    <span class="label-text">{{ node.label }}</span>
  </label>
  <div v-if="$slots.field_action" class="join">
    <textarea class="textarea textarea-bordered w-full join-item" :placeholder="node.placeholder"
      :disabled="node.disabled" v-model="model"></textarea>
    <slot name="field_action"></slot>
  </div>
  <textarea v-else class="textarea textarea-bordered w-full" :placeholder="node.placeholder" :disabled="node.disabled"
    v-model="model"></textarea>
  <p v-for="msg in errors?.errors" :key="msg" class="text-error text-sm">{{ msg }}</p>
</template>

<script setup lang="ts">
const model = defineModel<any>()
defineProps<{ node: ZFPNode, errors?: ErrorTree }>()
</script>
