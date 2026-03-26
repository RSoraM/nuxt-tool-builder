<template>
  <form @submit.prevent="validate">
    <fieldset class="fieldset border border-base-300 rounded-box p-4">
      <slot name="legend">
        <!-- <legend class="fieldset-legend">表单字段</legend> -->
      </slot>

      <div v-if="formErrors.length" class="mb-4 rounded-box border border-error/30 bg-error/10 p-3 text-sm text-error">
        <p v-for="(message, index) in formErrors" :key="`${index}-${message}`">{{ message }}</p>
      </div>

      <AutoFormField v-for="field in fields" :key="field.key" :field="field" :model="model" :errors="fieldErrors"
        path="" />

      <slot name="submit" :validate="validate" :model="model" :errors="fieldErrors" :form-errors="formErrors">
        <button type="button" class="btn btn-primary btn-block mt-4" @click="validate">校验</button>
      </slot>
    </fieldset>
  </form>
</template>

<script setup lang="ts">
import { z } from 'zod/v4'

import { zod_error_to_form_errors } from '../../../shared/utils/auto_form_kit'

const props = defineProps<{
  schema: z.ZodTypeAny
}>()

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

  const payload = structuredClone(toRaw(model))
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