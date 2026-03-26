<template>
  <form @submit.prevent="validate">
    <fieldset class="fieldset border border-base-300 rounded-box p-4">
      <slot name="legend"></slot>

      <div v-if="formErrors.length" class="mb-4 rounded-box border border-error/30 bg-error/10 p-3 text-sm text-error">
        <p v-for="(message, index) in formErrors" :key="`${index}-${message}`">{{ message }}</p>
      </div>

      <template v-for="field in fields" :key="field.key">
        <AutoFormFieldset
          v-if="field.type === 'object' || field.type === 'array' || field.type === 'discriminated_union'"
          :field="field" :model="model" :errors="fieldErrors" :path="field.path ?? ''" />
        <AutoFormField v-else :field="field" :model="model" :errors="fieldErrors" :path="field.path ?? ''" />
      </template>

      <slot name="submit" :validate="validate" :model="model" :errors="fieldErrors" :form-errors="formErrors">
        <button type="button" class="btn btn-primary btn-block mt-4" @click="validate">校验</button>
      </slot>
    </fieldset>
  </form>
</template>

<script setup lang="ts">
import { z } from 'zod/v4'

const props = defineProps<{
  schema: z.ZodTypeAny
}>()

interface auto_form_error_result {
  form_errors: string[]
  field_errors: Record<string, string[]>
}

const zod_error_to_form_errors = (error: z.ZodError): auto_form_error_result => {
  const tree = z.treeifyError(error)
  const result: auto_form_error_result = {
    form_errors: [],
    field_errors: {},
  }

  const collect_tree_errors = (
    node: { errors: string[]; properties?: Record<string, any>; items?: Array<any | undefined> },
    path: string,
  ) => {
    if (path && node.errors.length) {
      if (!result.field_errors[path]) {
        result.field_errors[path] = []
      }
      result.field_errors[path].push(...node.errors)
    } else if (!path && node.errors.length) {
      result.form_errors.push(...node.errors)
    }

    const append_path = (base: string, segment: string | number) => {
      const value = String(segment)
      return base ? `${base}-${value}` : value
    }

    for (const [key, child] of Object.entries(node.properties ?? {})) {
      if (!child) continue
      collect_tree_errors(child, append_path(path, key))
    }

    for (const [index, child] of (node.items ?? []).entries()) {
      if (!child) continue
      collect_tree_errors(child, append_path(path, index))
    }
  }

  collect_tree_errors(tree, '')

  return result
}

const { fields, defaults } = auto_form_kit(props.schema)
const model = reactive<Record<string, unknown>>(structuredClone(defaults))
const fieldErrors = reactive<Record<string, string[]>>({})
const formErrors = ref<string[]>([])

const clearErrors = () => {
  for (const key of Object.keys(fieldErrors)) {
    delete fieldErrors[key]
  }
  formErrors.value = []
}

const validate = () => {
  clearErrors()

  const payload = toRaw(model)
  const result = props.schema.safeParse(payload)
  if (result.success)
    return {
      valid: true,
      data: result.data,
    }

  const nextErrors = zod_error_to_form_errors(result.error)
  formErrors.value = nextErrors.form_errors

  for (const [path, messages] of Object.entries(nextErrors.field_errors) as Array<[string, string[]]>) {
    fieldErrors[path] = messages
  }

  return {
    valid: false,
    data: payload,
  }
}

defineExpose({
  model,
  fieldErrors,
  formErrors,
  validate,
})
</script>
