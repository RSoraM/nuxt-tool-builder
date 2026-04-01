<template>
  <form @submit.prevent>
    <AutoFormFieldset :node="node" :errors="errorTree" v-model="model">
      <template #submit>
        <slot />
      </template>
    </AutoFormFieldset>
  </form>
</template>

<script setup lang="ts">
import { z } from 'zod/v4'

const props = defineProps<{ node: ZFPNode, error: z.ZodError | undefined }>()
const model = defineModel()

const errorTree = computed(() => {
  if (!props.error) return undefined
  return z.treeifyError(props.error) as ErrorTree
})
</script>
