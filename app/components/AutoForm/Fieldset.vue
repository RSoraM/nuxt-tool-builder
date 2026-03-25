<template>
  <form @submit.prevent="validate">
    <fieldset class="fieldset border border-base-300 rounded-box p-4">
      <slot name="legend">
        <!-- <legend class="fieldset-legend">表单字段</legend> -->
      </slot>

      <AutoFormField v-for="field in fields" :key="field.key" :field="field" :model="model" :errors="errors" path="" />

      <slot name="submit" :validate="validate" :model="model" :errors="errors">
        <button type="button" class="btn btn-primary btn-block mt-4" @click="validate">校验</button>
      </slot>
    </fieldset>
  </form>
</template>

<script setup lang="ts">
import type { z } from 'zod/v4'

const props = defineProps<{
  schema: z.ZodTypeAny
}>()

const { fields, defaults } = auto_form_kit(props.schema)
const model = reactive<Record<string, unknown>>(structuredClone(defaults))
const errors = reactive<Record<string, string>>({})

const clearErrors = () => {
  for (const key of Object.keys(errors)) {
    delete errors[key]
  }
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


  for (const issue of result.error.issues) {
    const issuePath = zod_issue_path_to_string(issue.path as PropertyKey[])
    if (issuePath) errors[issuePath] = issue.message
  }

  return {
    valid: false,
    data: payload,
  }
}

defineExpose({
  model,
  errors,
  validate,
})
</script>