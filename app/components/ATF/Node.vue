<template>
  <component :is="component_map[node.template]" :node="node" v-model="data">
    <template #append>
      <slot name="append" />
    </template>

    <template #delete>
      <slot name="delete" />
    </template>

    <slot />
    <template #actions>
      <slot name="actions" />
    </template>
  </component>
</template>

<script setup lang="ts">
import {
  ATFObject,
  ATFArray,
  ATFText,
  ATFTextarea,
  ATFNumber,
  ATFToggle,
  ATFSelect,
  ATFFile,
  ATFUnion,
} from '#components'

const data = defineModel()
const { node } = defineProps<{ node: ATFNode }>()

const component_map = {
  'object': ATFObject,
  'array': ATFArray,
  'union': ATFUnion,
  'text': ATFText,
  'textarea': ATFTextarea,
  'number': ATFNumber,
  'toggle': ATFToggle,
  'select': ATFSelect,
  'file': ATFFile,
} as Record<string, Component>
</script>