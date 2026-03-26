<template>
  <fieldset class="fieldset border border-base-300 rounded-box p-4">
    <slot name="legend">
      <legend v-if="field.type === 'object'" class="fieldset-legend">{{ field.label }}</legend>
      <legend v-else-if="field.type === 'array'" class="fieldset-legend w-full justify-between">
        {{ field.label }}
        <button type="button" class="btn btn-primary btn-sm" @click="addArrayItem">新增</button>
      </legend>
      <legend v-else-if="field.type === 'discriminated_union'" class="fieldset-legend">{{ field.label }}</legend>
    </slot>

    <template v-if="field.type === 'object'">
      <template v-for="child in field.children" :key="`${fullPath}-${child.key}`">
        <AutoFormFieldset
          v-if="child.type === 'object' || child.type === 'array' || child.type === 'discriminated_union'"
          :field="child" :parent="nodeValue" :node-key="child.key" :errors="errors" :path="childPath(child)" />
        <AutoFormField v-else :field="child" :parent="nodeValue" :node-key="child.key" :errors="errors"
          :path="childPath(child)" />
      </template>
    </template>

    <template v-else-if="field.type === 'array'">
      <template v-for="(_, index) in arrayValue" :key="`${fullPath}-${index}`">
        <AutoFormFieldset
          v-if="field.item!.type === 'object' || field.item!.type === 'array' || field.item!.type === 'discriminated_union'"
          :field="field.item!" :parent="arrayValue" :node-key="index" :errors="errors" :path="itemPath(index)">
          <template #legend>
            <legend class="fieldset-legend w-full justify-between">
              {{ field.label }} - {{ index + 1 }}
              <button type="button" class="btn btn-primary btn-sm" @click="removeArrayItem(index)">删除</button>
            </legend>
          </template>
        </AutoFormFieldset>

        <AutoFormField v-else :field="field.item!" :parent="arrayValue" :node-key="index" :errors="errors"
          :path="itemPath(index)">
          <template #append>
            <button type="button" class="btn btn-primary btn-sm join-item" @click="removeArrayItem(index)">删除</button>
          </template>
        </AutoFormField>
      </template>

      <p v-if="fieldError" class="label text-error text-xs">{{ fieldError }}</p>
    </template>

    <template v-else-if="field.type === 'discriminated_union'">
      <label class="label">
        <span>{{ field.discriminator }}</span>
        <span v-if="field.required" class="badge badge-primary badge-xs">required</span>
      </label>
      <select class="select select-bordered w-full" :value="discriminatorValue" @change="handleDiscriminatorChange">
        <option v-for="option in field.options" :key="option.value" :value="option.value">{{ option.label }}</option>
      </select>

      <template v-for="child in currentVariantChildren" :key="`${fullPath}-${child.key}`">
        <AutoFormFieldset
          v-if="child.type === 'object' || child.type === 'array' || child.type === 'discriminated_union'"
          :field="child" :parent="nodeValue" :node-key="child.key" :errors="errors" :path="childPath(child)" />
        <AutoFormField v-else :field="child" :parent="nodeValue" :node-key="child.key" :errors="errors"
          :path="childPath(child)" />
      </template>

      <p v-if="fieldError" class="label text-error text-xs">{{ fieldError }}</p>
    </template>
  </fieldset>
</template>

<script setup lang="ts">
defineOptions({
  name: 'AutoFormFieldset',
})

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

const nodeValue = computed({
  get: () => props.parent?.[props.nodeKey],
  set: (value: unknown) => {
    props.parent[props.nodeKey] = value
  },
})

const appendPath = (base: string, segment: string | number) => {
  const value = String(segment)
  return base ? `${base}-${value}` : value
}

const childPath = (child: form_field_config) => {
  if (child.path !== undefined) {
    return child.path
  }
  if (!child.key) {
    return fullPath.value
  }
  return appendPath(fullPath.value, child.key)
}

const itemPath = (index: number) => {
  return appendPath(fullPath.value, index)
}

const arrayValue = computed(() => {
  const value = nodeValue.value
  return Array.isArray(value) ? value : []
})

const fieldError = computed(() => props.errors[fullPath.value]?.[0])

const addArrayItem = () => {
  const next = [...arrayValue.value]
  next.push(build_initial_value(props.field.item!))
  nodeValue.value = next
}

const removeArrayItem = (index: number) => {
  const next = [...arrayValue.value]
  next.splice(index, 1)
  nodeValue.value = next
}

const discriminatorValue = computed(() => {
  if (!props.field.discriminator) return ''
  const value = nodeValue.value
  if (value == null || typeof value !== 'object') return ''
  return String((value as Record<string, any>)[props.field.discriminator] ?? '')
})

const currentVariantChildren = computed(() => {
  if (!props.field.variants) return []
  return props.field.variants[discriminatorValue.value] ?? []
})

const handleDiscriminatorChange = (event: Event) => {
  if (!props.field.discriminator || !props.field.variant_defaults) return
  const newKey = (event.target as HTMLSelectElement).value
  nodeValue.value = structuredClone(props.field.variant_defaults[newKey] ?? { [props.field.discriminator]: newKey })
}
</script>