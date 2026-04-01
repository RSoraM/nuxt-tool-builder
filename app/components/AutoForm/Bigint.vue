<template>
  <label class="label">
    <span class="label-text">{{ node.label }}</span>
  </label>
  <div class="join w-full">
    <input type="text" class="input input-bordered w-full join-item" :placeholder="node.placeholder"
      :disabled="node.disabled" v-model="stringValue" />
    <slot name="field_action"></slot>
  </div>
  <p v-for="msg in errors?.errors" :key="msg" class="text-error text-sm">{{ msg }}</p>
</template>

<script setup lang="ts">
const model = defineModel<any>()
const props = defineProps<{ node: ZFPNode, errors?: ErrorTree }>()

const stringValue = ref('')

watch(() => model.value, () => {
  stringValue.value = model.value?.toString() ?? ''
}, { immediate: true })

watch(stringValue, (val) => {
  if (val === '' || val === '-') {
    return
  }
  try {
    model.value = BigInt(val)
  } catch {
    // Invalid BigInt, ignore
  }
})
</script>
