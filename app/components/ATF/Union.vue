<template>
  <ATFFieldset :legend="node.label">
    <template #append>
      <select class="select select-bordered select-xs w-40" :disabled="node.disabled || !has_options"
        v-model="selected_option">
        <option v-for="(option, index) in options" :key="`${option.label}-${index}`" :value="index">
          {{ option.label }}
        </option>
      </select>
    </template>

    <template #delete>
      <slot name="delete" />
    </template>

    <ATFNode v-if="active_node" :node="active_node" v-model="data" />
    <div v-else class="text-sm opacity-60">无可用选项</div>

    <slot />
    <slot name="actions" />
  </ATFFieldset>
</template>

<script setup lang="ts">
import { cloneDeep } from 'lodash-es'

const data = defineModel<any>()
const { node } = defineProps<{ node: ATFNode }>()

const options = computed(() => node.union || [])
const has_options = computed(() => options.value.length > 0)

const selected_index = ref(0)
const drafts = ref<Record<number, any>>({})

const has_draft = (index: number) => Object.prototype.hasOwnProperty.call(drafts.value, index)

const resolve_matching_index = (value: any) => options.value.findIndex((option) => option.node.schema.safeParse(value).success)

const initialize = () => {
  drafts.value = {}

  if (!has_options.value) {
    selected_index.value = 0
    data.value = undefined
    return
  }

  const matched_index = resolve_matching_index(data.value)
  const next_index = matched_index >= 0 ? matched_index : 0
  selected_index.value = next_index

  if (matched_index >= 0) {
    drafts.value[next_index] = cloneDeep(data.value)
    return
  }

  const next_value = cloneDeep(options.value[next_index]?.node?.default)
  drafts.value[next_index] = cloneDeep(next_value)
  data.value = next_value
}

const switch_option = (next_index_raw: number | string) => {
  const next_index = Number(next_index_raw)

  if (!Number.isInteger(next_index) || next_index < 0 || next_index >= options.value.length) return
  if (next_index === selected_index.value) return

  drafts.value[selected_index.value] = cloneDeep(data.value)
  selected_index.value = next_index

  if (has_draft(next_index)) {
    data.value = cloneDeep(drafts.value[next_index])
    return
  }

  const next_value = cloneDeep(options.value[next_index]?.node?.default)
  drafts.value[next_index] = cloneDeep(next_value)
  data.value = next_value
}

const selected_option = computed({
  get: () => selected_index.value,
  set: (next_index) => switch_option(next_index),
})

const active_node = computed(() => options.value[selected_index.value]?.node)

watch(
  () => node.union,
  () => initialize(),
  { immediate: true, deep: true }
)

watch(
  data,
  () => {
    if (!has_options.value) return
    drafts.value[selected_index.value] = cloneDeep(data.value)
  },
  { deep: true }
)
</script>
