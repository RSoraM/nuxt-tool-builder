<template>
  <ATFFieldset :legend="node.label">
    <template #append>
      <button class="btn btn-primary btn-xs" @click="add_entry()">
        添加
      </button>
    </template>

    <template #delete>
      <slot name="delete" />
    </template>

    <ATFFieldset v-for="(entry, index) in entries" :key="entry.id" :legend="`${index}`">
      <template #delete>
        <button class="btn btn-error btn-xs" @click="delete_entry(entry.id)">删除</button>
      </template>

      <label class="label">键</label>
      <input type="text" class="input input-bordered w-full" v-model="entry.key" @input="sync_to_model" />

      <ATFNode :node="node.record!.value" :modelValue="entry.value"
        @update:modelValue="(v: any) => update_entry_value(entry.id, v)" />
    </ATFFieldset>

    <slot />
    <slot name="actions" />
  </ATFFieldset>
</template>

<script setup lang="ts">
import { cloneDeep, isPlainObject } from 'lodash-es'

const data = defineModel<any>()
const { node } = defineProps<{ node: ATFNode }>()

interface Entry {
  id: number
  key: string
  value: any
}

let next_id = 0
const entries = ref<Entry[]>([])

const add_entry = () => {
  entries.value.push({
    id: next_id++,
    key: '',
    value: cloneDeep(node.record?.value.default),
  })
  sync_to_model()
}

const delete_entry = (id: number) => {
  entries.value = entries.value.filter(e => e.id !== id)
  sync_to_model()
}

const update_entry_value = (id: number, value: any) => {
  const entry = entries.value.find(e => e.id === id)
  if (entry) {
    entry.value = value
    sync_to_model()
  }
}

const sync_to_model = () => {
  const result: Record<string, any> = {}
  for (const entry of entries.value) {
    if (entry.key !== '') {
      result[entry.key] = entry.value
    }
  }
  data.value = result
}

const init_from_model = (obj: Record<string, any>) => {
  entries.value = Object.entries(obj).map(([key, value]) => ({
    id: next_id++,
    key,
    value: cloneDeep(value),
  }))
}

if (isPlainObject(data.value) && Object.keys(data.value).length > 0) {
  init_from_model(data.value)
} else if (isPlainObject(node.default) && Object.keys(node.default).length > 0) {
  data.value = cloneDeep(node.default)
  init_from_model(data.value)
} else {
  data.value = {}
}
</script>
