<template>
  <form @submit.prevent>
    <AutoFormFieldset :node="node" v-model="model">
      <template #submit>
        <slot />
      </template>
    </AutoFormFieldset>
  </form>
</template>

<script setup lang="ts">
defineProps<{ node: ZFPNode }>()
const model = defineModel()
</script>
