<template>
  <label class="label">{{ node.label }}</label>
  <template v-if="$slots.delete">
    <div class="join">
      <select class="select select-bordered w-full join-item" v-model="data">
        <option v-for="option in options" :key="`${option.label}-${option.value}`" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <slot name="delete" />
    </div>
  </template>
  <template v-else>
    <select class="select select-bordered w-full" v-model="data">
      <option v-for="option in options" :key="`${option.label}-${option.value}`" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </template>
</template>

<script setup lang="ts">
const data = defineModel<any>()
const { node } = defineProps<{ node: ATFNode }>()

const options = computed(() => node.options || [])
const hasOption = (value: any) => options.value.some((option) => Object.is(option.value, value))

onMounted(() => {
  if (hasOption(data.value)) return

  data.value = hasOption(node.default)
    ? node.default
    : options.value[0]?.value
})
</script>