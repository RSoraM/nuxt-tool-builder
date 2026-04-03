<template>
  <label class="label">{{ node.label }}</label>
  <template v-if="$slots.delete">
    <div class="join">
      <div class="join-item flex">
        <input v-for="(part, index) in node.template_literal" :key="index" type="text"
          class="input input-bordered join-item" :class="part.disabled ? 'w-auto bg-base-200' : 'grow'"
          :disabled="part.disabled" v-model="parts[index]" @input="sync_to_model"
          :style="part.disabled ? { width: `${(parts[index]?.length || 1) + 2}ch` } : {}" />
      </div>
      <slot name="delete" />
    </div>
  </template>
  <template v-else>
    <div class="join w-full">
      <input v-for="(part, index) in node.template_literal" :key="index" type="text"
        class="input input-bordered join-item" :class="part.disabled ? 'w-auto bg-base-200' : 'grow'"
        :disabled="part.disabled" v-model="parts[index]" @input="sync_to_model"
        :style="part.disabled ? { width: `${(parts[index]?.length || 1) + 2}ch` } : {}" />
    </div>
  </template>
</template>

<script setup lang="ts">
const data = defineModel<any>()
const { node } = defineProps<{ node: ATFNode }>()

const parts = ref<string[]>([])

const sync_to_model = () => {
  data.value = parts.value.join('')
}

parts.value = (node.template_literal || []).map(part => part.default ?? '')
sync_to_model()
</script>
