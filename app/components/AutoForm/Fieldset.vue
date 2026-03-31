<template>
  <fieldset class="fieldset border border-base-300 rounded-box p-4">
    <legend class="fieldset-legend w-full justify-between">
      <span>{{ node.label }}</span>
      <slot name="legend_action"></slot>
    </legend>

    <AutoFormField v-for="key in Object.keys(children)" :key="key" :node="children[key]!" v-model="model[key]" />

    <slot name="submit" />
  </fieldset>
</template>

<script setup lang="ts">
const model = defineModel<any>()
const props = defineProps<{ node: ZFPNode }>()

const children = computed(() => props.node.children || {})
</script>