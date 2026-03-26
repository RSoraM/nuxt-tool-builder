<template>
  <template v-if="field.type === 'object'">
    <fieldset class="fieldset border border-base-300 rounded-box p-4">
      <slot name="legend">
        <legend class="fieldset-legend">{{ field.label }}</legend>
      </slot>

      <AutoFormField v-for="child in field.children" :key="`${fullPath}.${child.key}`" :field="child" :model="model"
        :errors="errors" :path="fullPath" />
    </fieldset>
  </template>

  <template v-else-if="field.type === 'array'">
    <fieldset class="fieldset border border-base-300 rounded-box p-4">
      <legend class="fieldset-legend w-full justify-between">
        {{ field.label }}
        <button type="button" class="btn btn-primary btn-sm" @click="addArrayItem">新增</button>
      </legend>

      <template v-for="(_, index) in arrayValue" :key="`${fullPath}[${index}]`">
        <AutoFormField v-if="field.item!.type === 'object' || field.item!.type === 'array'" :field="field.item!"
          :model="model" :errors="errors" :path="`${fullPath}[${index}]`">
          <template #legend>
            <legend class="fieldset-legend w-full justify-between">
              {{ field.label }} - {{ index + 1 }}
              <button type="button" class="btn btn-primary btn-sm" @click="removeArrayItem(index)">删除</button>
            </legend>
          </template>
        </AutoFormField>

        <AutoFormField v-else :field="field.item!" :model="model" :errors="errors" :path="`${fullPath}[${index}]`">
          <template #append>
            <button type="button" class="btn btn-primary btn-sm join-item" @click="removeArrayItem(index)">删除</button>
          </template>
        </AutoFormField>
      </template>

      <p v-if="fieldError" class="label text-error text-xs">{{ fieldError }}</p>
    </fieldset>
  </template>

  <template v-else>
    <template v-if="field.type === 'checkbox'">
      <label class="label items-center justify-between">
        <span class="flex gap-2 items-center">
          {{ field.label }}
          <span v-if="field.required" class="badge badge-primary badge-xs">required</span>
        </span>

        <div class="flex gap-2 items-center">
          <slot name="prefix"></slot>
          <input type="checkbox" class="toggle" :checked="Boolean(scalarValue)"
            :autocomplete="field.autocomplete ?? 'off'"
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
          :autocomplete="field.autocomplete ?? 'off'" :value="(scalarValue as string | undefined) ?? ''"
          @change="scalarValue = ($event.target as HTMLSelectElement).value">
          <option value="" disabled>请选择</option>
          <option v-for="option in field.options" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>

        <textarea v-else-if="field.type === 'textarea'" class="textarea textarea-bordered w-full join-item"
          :placeholder="field.placeholder" :autocomplete="field.autocomplete ?? 'off'"
          :value="(scalarValue as string | undefined) ?? ''"
          @input="scalarValue = ($event.target as HTMLTextAreaElement).value" />

        <input v-else-if="field.type === 'number'" type="number" class="input input-bordered w-full join-item"
          :placeholder="field.placeholder" :autocomplete="field.autocomplete ?? 'off'" :value="scalarValue ?? ''"
          @input="updateNumberValue(($event.target as HTMLInputElement).value)">

        <input v-else :type="field.type" class="input input-bordered w-full join-item" :placeholder="field.placeholder"
          :autocomplete="field.autocomplete ?? 'off'" :value="(scalarValue as string | undefined) ?? ''"
          @input="scalarValue = ($event.target as HTMLInputElement).value">

        <slot name="append"></slot>
      </div>
    </template>


    <p v-if="field.description" class="label text-xs text-base-content/60">{{ field.description }}</p>
    <p v-if="fieldError" class="label text-error text-xs">{{ fieldError }}</p>
  </template>
</template>

<script setup lang="ts">
defineOptions({
  name: 'AutoFormField',
})

const props = withDefaults(defineProps<{
  field: form_field_config
  model: Record<string, unknown>
  errors: Record<string, string[]>
  path?: string
}>(), {
  path: '',
})

const fullPath = computed(() => {
  if (!props.field.key) {
    return props.path
  }

  if (!props.path) {
    return props.field.key
  }

  return `${props.path}.${props.field.key}`
})

const scalarValue = computed({
  get: () => get_value_at_path(props.model, fullPath.value),
  set: (value: unknown) => set_value_at_path(props.model, fullPath.value, value),
})

const arrayValue = computed(() => {
  const value = get_value_at_path(props.model, fullPath.value)
  return Array.isArray(value) ? value : []
})

const fieldError = computed(() => props.errors[fullPath.value]?.[0])

const addArrayItem = () => {
  const next = [...arrayValue.value]
  next.push(build_initial_value(props.field.item!))
  set_value_at_path(props.model, fullPath.value, next)
}

const removeArrayItem = (index: number) => {
  const next = [...arrayValue.value]
  next.splice(index, 1)
  set_value_at_path(props.model, fullPath.value, next)
}

const updateNumberValue = (raw: string) => {
  if (raw === '') {
    scalarValue.value = undefined
    return
  }

  const parsed = Number(raw)
  scalarValue.value = Number.isNaN(parsed) ? undefined : parsed
}
</script>