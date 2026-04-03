<template>
  <fieldset class="fieldset border border-base-300 rounded-box p-4">
    <legend class="legend flex items-center gap-2">
      <slot name="delete" />
      <slot name="legend">
        <span>{{ legend }}</span>
      </slot>
      <slot name="append" />
    </legend>

    <slot />
    <slot name="actions" />
  </fieldset>
</template>

<script setup lang="ts">
defineProps<{ legend: string }>()
</script>