<template>
  <div class="text-error">Unsupported template: {{ node.template }}</div>
</template>

<script setup lang="ts">
defineModel<any>()
defineProps<{ node: ZFPNode }>()
</script>
