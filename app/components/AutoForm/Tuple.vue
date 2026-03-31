<template>
  <fieldset class="fieldset border border-base-300 rounded-box p-4">
    <legend class="fieldset-legend w-full justify-between">
      <span>{{ node.label }}</span>
      <slot name="legend_action"></slot>
    </legend>

    <!-- Render tuple children as a grid -->
    <div class="grid gap-4" :style="{ gridTemplateColumns: `repeat(${childKeys.length}, 1fr)` }">
      <AutoFormField v-for="key in childKeys" :key="key" :node="children[key]!" v-model="model![Number(key)]" />
    </div>

  </fieldset>
</template>

<script setup lang="ts">
const model = defineModel<any[]>()
const props = defineProps<{ node: ZFPNode }>()

const children = computed(() => props.node.children || {})
const childKeys = computed(() => Object.keys(children.value).sort((a, b) => Number(a) - Number(b)))
</script>