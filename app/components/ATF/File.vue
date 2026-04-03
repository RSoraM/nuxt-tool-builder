<template>
  <label class="label">{{ node.label }}</label>
  <template v-if="$slots.delete">
    <div class="join">
      <input type="file" class="file-input file-input-bordered w-full join-item" @change="onFileChange" />
      <slot name="delete" />
    </div>
  </template>
  <template v-else>
    <input type="file" class="file-input file-input-bordered w-full" @change="onFileChange" />
  </template>

  <label v-if="fileName" class="label text-xs">{{ fileName }}</label>
</template>

<script setup lang="ts">
const data = defineModel<any>()
const { node } = defineProps<{ node: ATFNode }>()

const isFileValue = (value: unknown): value is File => typeof File !== 'undefined' && value instanceof File

const fileName = computed(() => isFileValue(data.value) ? data.value.name : '')

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  data.value = target.files?.item(0) || null
}

onMounted(() => {
  if (isFileValue(data.value)) return

  data.value = isFileValue(node.default)
    ? node.default
    : null
})
</script>