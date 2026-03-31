<template>
  <fieldset class="fieldset border border-base-300 rounded-box p-4">
    <legend class="fieldset-legend w-full justify-between">
      <span>{{ node.label }}</span>
      <slot name="legend_action"></slot>
    </legend>

    <!-- Option selector tabs -->
    <div v-if="node.options && node.options.length > 1" role="tablist" class="tabs tabs-border mb-4">
      <button v-for="(option, index) in node.options" :key="index" type="button" role="tab" class="tab"
        :class="{ 'tab-active': selectedIndex === index }" @click="selectOption(index)">
        {{ option.label }}
      </button>
    </div>

    <!-- Single option - show directly without tabs -->
    <template v-else-if="selectedOption">
      <AutoFormField :node="selectedOption" v-model="model">
        <template #field_action>
          <slot name="legend_action" />
        </template>
      </AutoFormField>
    </template>

    <!-- Selected option fields -->
    <template v-if="selectedOption && Object.keys(selectedOption.children || {}).length">
      <AutoFormFieldset v-if="selectedOption.template === 'object'" :node="selectedOption" v-model="model">
        <template #legend_action>
          <slot name="legend_action" />
        </template>
      </AutoFormFieldset>
      <AutoFormField v-else :node="selectedOption" v-model="model">
        <template #field_action>
          <slot name="legend_action" />
        </template>
      </AutoFormField>
    </template>

  </fieldset>
</template>

<script setup lang="ts">
const model = defineModel<any>()
const props = defineProps<{ node: ZFPNode }>()

const children = computed(() => props.node.children || {})
const options = computed(() => props.node.options || [])

// Track selected option index
const selectedIndex = ref(0)

const selectedOption = computed(() => {
  return children.value[String(selectedIndex.value)]
})

const selectOption = (index: number) => {
  selectedIndex.value = index
  // Initialize model with the default values from the selected option
  if (selectedOption.value?.default) {
    model.value = { ...selectedOption.value.default }
  } else if (selectedOption.value?.children) {
    const defaults: any = {}
    for (const key in selectedOption.value.children) {
      defaults[key] = selectedOption.value!.children![key]!.default ?? ''
    }
    model.value = defaults
  }
}

// Initialize with first option
onMounted(() => {
  selectOption(0)
})
</script>