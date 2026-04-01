<template>
  <fieldset class="fieldset border border-base-300 rounded-box p-4">
    <legend class="fieldset-legend w-full justify-between">
      <span>{{ node.label }}</span>
      <slot name="field_action"></slot>
      <button type="button" class="btn btn-primary btn-sm" @click="addEntry">
        添加
      </button>
    </legend>

    <template v-if="element">
      <div v-for="key in modelKeys" :key="key" class="flex gap-2 items-start mb-2">
        <input type="text" class="input input-bordered w-40" :value="key" placeholder="Key"
          @change="renameKey(key, ($event.target as HTMLInputElement).value)" />
        <div class="flex-1">
          <AutoFormField :node="element" v-model="model[key]" />
        </div>
        <button type="button" class="btn btn-error btn-sm" @click="removeEntry(key)">删除</button>
      </div>
    </template>

    <p v-else class="text-base-content/50">Element Not exist</p>
  </fieldset>
</template>

<script setup lang="ts">
const model = defineModel<any>()
const props = defineProps<{ node: ZFPNode }>()

const element = computed(() => props.node.element)
const modelKeys = computed(() => Object.keys(model.value || {}))

let counter = 0
const addEntry = () => {
  const newKey = `key_${counter++}`
  model.value[newKey] = structuredClone(element.value?.default)
}
const removeEntry = (key: string) => {
  delete model.value[key]
}
const renameKey = (oldKey: string, newKey: string) => {
  if (!newKey || newKey === oldKey) return
  if (newKey in model.value) return
  const val = model.value[oldKey]
  delete model.value[oldKey]
  model.value[newKey] = val
}
</script>
