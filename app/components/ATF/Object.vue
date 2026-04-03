<template>
  <ATFFieldset :legend="node.label">
    <template #delete>
      <slot name="delete" />
    </template>

    <ATFNode v-for="[key, value] in Object.entries(node.props || {})" :key="key" :node="value"
      :modelValue="resolve_field_value(key)" @update:modelValue="(next_value) => update_field_value(key, next_value)" />

    <slot />
    <slot name="actions" />
  </ATFFieldset>
</template>

<script setup lang="ts">
import { cloneDeep, isObject } from 'lodash-es'

const data = defineModel<any>()
const { node } = defineProps<{ node: ATFNode }>()

const resolve_field_value = (key: string) =>
  isObject(data.value)
    ? (data.value as Record<string, any>)[key]
    : undefined

const update_field_value = (key: string, next_value: any) => {
  const next_object = isObject(data.value)
    ? { ...(data.value as Record<string, any>) }
    : {}

  next_object[key] = next_value
  data.value = next_object
}

watchEffect(() => {
  if (isObject(data.value)) return

  data.value = isObject(node.default)
    ? cloneDeep(node.default)
    : {}
})
</script>