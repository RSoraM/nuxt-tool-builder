<template>
  <template v-if="field.type === 'checkbox'">
    <label class="label items-center justify-between">
      <span class="flex gap-2 items-center">
        {{ field.label }}
        <span v-if="field.required" class="badge badge-primary badge-xs">required</span>
      </span>

      <div class="flex gap-2 items-center">
        <slot name="prefix"></slot>
        <input type="checkbox" class="toggle" :class="fieldError ? 'toggle-error' : ''"
          :autocomplete="field.autocomplete ?? 'off'" v-model="scalarValue">
        <slot name="append"></slot>
      </div>
    </label>
  </template>

  <template v-else>
    <span class="label">
      {{ field.label }}
      <span v-if="field.required" class="badge badge-primary badge-xs">required</span>
    </span>

    <div class="join">
      <slot name="prefix"></slot>

      <select v-if="field.type === 'select'" class="select select-bordered w-full join-item"
        :class="fieldError ? 'select-error' : ''" :placeholder="field.placeholder"
        :autocomplete="field.autocomplete ?? 'off'" v-model="scalarValue">
        <option value="" disabled>请选择</option>
        <option v-for="option in field.options" :key="option.value" :value="option.value">{{ option.label }}</option>
      </select>

      <textarea v-else-if="field.type === 'textarea'" class="textarea textarea-bordered w-full join-item"
        :class="fieldError ? 'textarea-error' : ''" :placeholder="field.placeholder"
        :autocomplete="field.autocomplete ?? 'off'" v-model="scalarValue" />

      <input v-else-if="field.type === 'number'" type="number" class="input input-bordered w-full join-item"
        :class="fieldError ? 'input-error' : ''" :placeholder="field.placeholder"
        :autocomplete="field.autocomplete ?? 'off'" v-model="scalarValue">

      <input v-else :type="field.type" class="input input-bordered w-full join-item"
        :class="fieldError ? 'input-error' : ''" :placeholder="field.placeholder"
        :autocomplete="field.autocomplete ?? 'off'" v-model="scalarValue">

      <slot name="append"></slot>
    </div>
  </template>

  <p v-if="field.description" class="label text-xs text-base-content/60">{{ field.description }}</p>
  <p v-if="fieldError" class="label text-error text-xs">{{ fieldError }}</p>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  field: form_field_config
  parent: any
  nodeKey: string | number
  errors: Record<string, string[]>
  path?: string
}>(), {
  path: '',
})

const fullPath = computed(() => props.path ?? '')

const scalarValue = computed({
  get: () => props.parent?.[props.nodeKey],
  set: (value: unknown) => {
    props.parent[props.nodeKey] = value
  },
})

const fieldError = computed(() => props.errors[fullPath.value]?.[0])
</script>