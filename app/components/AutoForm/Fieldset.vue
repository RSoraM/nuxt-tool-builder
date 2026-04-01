<template>
  <fieldset class="fieldset border border-base-300 rounded-box p-4">
    <legend class="fieldset-legend w-full justify-between">
      <span>{{ node.label }}</span>
      <slot name="legend_action"></slot>
    </legend>

    <p v-for="msg in errors?.errors" :key="msg" class="text-error text-sm">{{ msg }}</p>

    <AutoFormField v-for="key in visibleChildren" :key="key" :node="children[key]!" :errors="errors?.properties?.[key]"
      v-model="model[key]" />

    <slot name="submit" />
  </fieldset>
</template>

<script setup lang="ts">
const model = defineModel<any>()
const props = defineProps<{ node: ZFPNode, errors?: ErrorTree }>()

const children = computed(() => props.node.children || {})
const visibleChildren = computed(() => Object.keys(children.value).filter(key => !children.value[key]?.hidden))
</script>