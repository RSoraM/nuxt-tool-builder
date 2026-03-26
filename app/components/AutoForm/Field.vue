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
          :autocomplete="field.autocomplete ?? 'off'" :checked="Boolean(scalarValue)"
          @change="scalarValue = ($event.target as HTMLInputElement).checked">
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
        :autocomplete="field.autocomplete ?? 'off'" :value="(scalarValue as string | undefined) ?? ''"
        @change="scalarValue = ($event.target as HTMLSelectElement).value">
        <option value="" disabled>请选择</option>
        <option v-for="option in field.options" :key="option.value" :value="option.value">{{ option.label }}</option>
      </select>

      <textarea v-else-if="field.type === 'textarea'" class="textarea textarea-bordered w-full join-item"
        :class="fieldError ? 'textarea-error' : ''" :placeholder="field.placeholder"
        :autocomplete="field.autocomplete ?? 'off'" :value="(scalarValue as string | undefined) ?? ''"
        @input="scalarValue = ($event.target as HTMLTextAreaElement).value" />

      <input v-else-if="field.type === 'number'" type="number" class="input input-bordered w-full join-item"
        :class="fieldError ? 'input-error' : ''" :placeholder="field.placeholder"
        :autocomplete="field.autocomplete ?? 'off'" :value="scalarValue ?? ''"
        @input="updateNumberValue(($event.target as HTMLInputElement).value)">

      <input v-else :type="field.type" class="input input-bordered w-full join-item"
        :class="fieldError ? 'input-error' : ''" :placeholder="field.placeholder"
        :autocomplete="field.autocomplete ?? 'off'" :value="(scalarValue as string | undefined) ?? ''"
        @input="scalarValue = ($event.target as HTMLInputElement).value">

      <slot name="append"></slot>
    </div>
  </template>

  <p v-if="field.description" class="label text-xs text-base-content/60">{{ field.description }}</p>
  <p v-if="fieldError" class="label text-error text-xs">{{ fieldError }}</p>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  field: form_field_config
  model: Record<string, unknown>
  errors: Record<string, string[]>
  path?: string
}>(), {
  path: '',
})

const fullPath = computed(() => {
  if (props.field.path !== undefined) return props.field.path
  if (!props.field.key) return props.path
  return props.path ? `${props.path}-${props.field.key}` : props.field.key
})

const scalarValue = computed({
  get: () => get_value_at_path(props.model, fullPath.value),
  set: (value: unknown) => set_value_at_path(props.model, fullPath.value, value),
})

const fieldError = computed(() => props.errors[fullPath.value]?.[0])

const updateNumberValue = (raw: string) => {
  if (raw === '') {
    scalarValue.value = undefined
    return
  }

  const parsed = Number(raw)
  scalarValue.value = Number.isNaN(parsed) ? undefined : parsed
}
</script>