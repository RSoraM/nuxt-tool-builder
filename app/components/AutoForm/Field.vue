<template v-if="!node.hidden">
  <component :is="fieldComponent" :node="node" v-model="model">
    <template #field_action>
      <slot name="field_action" />
    </template>
    <template #legend_action>
      <slot name="field_action" />
    </template>
  </component>
</template>

<script setup lang="ts">
const model = defineModel<any>()
const props = defineProps<{ node: ZFPNode }>()

const componentMap = {
  text: resolveComponent('AutoFormFieldText'),
  password: resolveComponent('AutoFormFieldPassword'),
  textarea: resolveComponent('AutoFormFieldTextarea'),
  json: resolveComponent('AutoFormFieldJson'),
  number: resolveComponent('AutoFormFieldNumber'),
  bigint: resolveComponent('AutoFormBigint'),
  date: resolveComponent('AutoFormFieldDate'),
  file: resolveComponent('AutoFormFieldFile'),
  select: resolveComponent('AutoFormFieldSelect'),
  checkbox: resolveComponent('AutoFormFieldCheckbox'),
  object: resolveComponent('AutoFormFieldset'),
  array: resolveComponent('AutoFormArray'),
  union: resolveComponent('AutoFormUnion'),
  tuple: resolveComponent('AutoFormTuple'),
  record: resolveComponent('AutoFormFieldRecord'),
} as Record<string, Component>

const fallback = resolveComponent('AutoFormFieldUnsupported')

const fieldComponent = computed(() => componentMap[props.node.template] || fallback)
</script>