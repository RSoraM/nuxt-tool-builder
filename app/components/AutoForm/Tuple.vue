<template>
  <fieldset class="fieldset border border-base-300 rounded-box p-4">
    <legend class="fieldset-legend w-full justify-between">
      <span>{{ node.label }}</span>
      <slot name="legend_action"></slot>
    </legend>

    <p v-for="msg in errors?.errors" :key="msg" class="text-error text-sm">{{ msg }}</p>

    <!-- Render tuple children as a grid -->
    <div class="grid gap-4" :style="{ gridTemplateColumns: `repeat(${childKeys.length}, 1fr)` }">
      <AutoFormField v-for="key in childKeys" :key="key" :node="children[key]!" :errors="errors?.items?.[Number(key)]"
        v-model="model![Number(key)]" />
    </div>

  </fieldset>
</template>

<script setup lang="ts">
const model = defineModel<any[]>()
const props = defineProps<{ node: ZFPNode, errors?: ErrorTree }>()

const children = computed(() => props.node.children || {})
const childKeys = computed(() => Object.keys(children.value).sort((a, b) => Number(a) - Number(b)))
</script>