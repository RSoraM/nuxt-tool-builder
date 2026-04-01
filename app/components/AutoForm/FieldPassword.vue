<template>
  <label class="label">
    <span class="label-text">{{ node.label }}</span>
  </label>
  <div v-if="$slots.field_action" class="join">
    <input type="password" class="input input-bordered w-full join-item" :placeholder="node.placeholder"
      :autocomplete="node.autoComplete" :disabled="node.disabled" v-model="model" />
    <slot name="field_action"></slot>
  </div>
  <input v-else type="password" class="input input-bordered w-full" :placeholder="node.placeholder"
    :autocomplete="node.autoComplete" :disabled="node.disabled" v-model="model" />
  <p v-for="msg in errors?.errors" :key="msg" class="text-error text-sm">{{ msg }}</p>
</template>

<script setup lang="ts">
const model = defineModel<any>()
defineProps<{ node: ZFPNode, errors?: ErrorTree }>()
</script>
