<template>
  <ATFFieldset :legend="node.label">
    <template #append>
      <button class="btn btn-primary btn-xs" @click="append_item()">
        添加
      </button>
    </template>

    <template #delete>
      <slot name="delete" />
    </template>

    <ATFNode v-for="(item, index) in data" :key="resolve_item_key(item, index)" :node="node.element!"
      v-model="data[index]">
      <template #delete>
        <button class="btn btn-error" :class="resolve_delete_class()" @click="() => delete_item(Number(index))">
          删除
        </button>
      </template>
    </ATFNode>

    <slot />
    <slot name="actions" />
  </ATFFieldset>
</template>

<script setup lang="ts">
import { cloneDeep, isArray } from 'lodash-es'

const data = defineModel<any>()
const { node } = defineProps<{ node: ATFNode }>()

const object_item_keys = new WeakMap<object, number>()
let next_item_key = 0

const resolve_delete_class = () =>
  !node.element || isPrimitiveTemplate(node.element.template)
    ? 'join-item'
    : 'btn-xs'

const resolve_item_key = (item: unknown, index: string | number) => {
  if (item !== null && typeof item === 'object') {
    const target = item as object

    if (!object_item_keys.has(target)) {
      object_item_keys.set(target, next_item_key++)
    }

    return `atf-array-object-${object_item_keys.get(target)}`
  }

  return `atf-array-primitive-${index}`
}

const append_item = () => {
  data.value.push(cloneDeep(node.element?.default))
}
const delete_item = (index: number) => {
  data.value.splice(index, 1)
}

onMounted(() => {
  if (isArray(data.value)) return

  data.value = isArray(node.default)
    ? cloneDeep(node.default)
    : []
})
</script>