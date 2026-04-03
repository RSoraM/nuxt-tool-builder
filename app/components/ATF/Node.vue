<template>
  <component :is="component" :node="node" v-model="data">
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
  ATFTuple,
  ATFRecord,
  ATFTemplateLiteral,
  ATFUnion,
  ATFJson,
  ATFCodeMirror,
} from '#components'

const data = defineModel()
const { node } = defineProps<{ node: ATFNode }>()

const component_map = {
  'object': ATFObject,
  'array': ATFArray,
  'text': ATFText,
  'textarea': ATFTextarea,
  'number': ATFNumber,
  'toggle': ATFToggle,
  'select': ATFSelect,
  'file': ATFFile,
  'tuple': ATFTuple,
  'record': ATFRecord,
  'template_literal': ATFTemplateLiteral,
  'union': ATFUnion,
  'json': ATFJson,
  'codemirror': ATFCodeMirror,
} as Record<string, Component>
const component = computed(() => component_map[node.template])
</script>