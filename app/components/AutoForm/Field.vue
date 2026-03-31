<template v-if="!node.hidden">
  <template v-if="node.template === 'text'">
    <label class="label">
      <span class="label-text">{{ node.label }}</span>
    </label>
    <div v-if="$slots.field_action" class="join">
      <input type="text" class="input input-bordered w-full join-item" :placeholder="node.placeholder"
        :autocomplete="node.autoComplete" :disabled="node.disabled" v-model="model" />
      <slot name="field_action"></slot>
    </div>
    <input v-else type="text" class="input input-bordered w-full" :placeholder="node.placeholder"
      :autocomplete="node.autoComplete" :disabled="node.disabled" v-model="model" />
  </template>

  <template v-else-if="node.template === 'password'">
    <label class="label">
      <span class="label-text">{{ node.label }}</span>
    </label>
    <div v-if="$slots.field_action" class="join">
      <input type="password" class="input input-bordered w-full join-item" :placeholder="node.placeholder"
        :autocomplete="node.autoComplete" :disabled="node.disabled" v-model="model" />
      <slot name="field_action"></slot>
    </div>
    <input v-else type="password" class="input input-bordered w-full" :placeholder="node.placeholder"
      :autocomplete="node.autoComplete" :disabled="node.disabled" v-model="model" />
  </template>

  <template v-else-if="node.template === 'textarea'">
    <label class="label">
      <span class="label-text">{{ node.label }}</span>
    </label>
    <div v-if="$slots.field_action" class="join">
      <textarea class="textarea textarea-bordered w-full join-item" :placeholder="node.placeholder"
        :disabled="node.disabled" v-model="model"></textarea>
      <slot name="field_action"></slot>
    </div>
    <textarea v-else class="textarea textarea-bordered w-full" :placeholder="node.placeholder" :disabled="node.disabled"
      v-model="model"></textarea>
  </template>

  <template v-else-if="node.template === 'json'">
    <label class="label">
      <span class="label-text">{{ node.label }}</span>
    </label>
    <div v-if="$slots.field_action" class="join">
      <textarea class="textarea w-full join-item" :placeholder="node.placeholder" :autocomplete="node.autoComplete"
        :disabled="node.disabled" v-model="model"></textarea>
      <slot name="field_action"></slot>
    </div>
    <textarea v-else class="textarea w-full" :placeholder="node.placeholder" :autocomplete="node.autoComplete"
      :disabled="node.disabled" v-model="model"></textarea>
  </template>

  <template v-else-if="node.template === 'number'">
    <label class="label">
      <span class="label-text">{{ node.label }}</span>
    </label>
    <div v-if="$slots.field_action" class="join">
      <input type="number" class="input input-bordered w-full join-item" :placeholder="node.placeholder"
        :autocomplete="node.autoComplete" :disabled="node.disabled" v-model.number="model" />
      <slot name="field_action"></slot>
    </div>
    <input v-else type="number" class="input input-bordered w-full" :placeholder="node.placeholder"
      :autocomplete="node.autoComplete" :disabled="node.disabled" v-model.number="model" />
  </template>

  <template v-else-if="node.template === 'bigint'">
    <AutoFormBigint :node="node" v-model="model">
      <template #field_action>
        <slot name="field_action" />
      </template>
    </AutoFormBigint>
  </template>

  <template v-else-if="node.template === 'date'">
    <label class="label">
      <span class="label-text">{{ node.label }}</span>
    </label>
    <div v-if="$slots.field_action" class="join">
      <input type="date" class="input input-bordered w-full join-item" :placeholder="node.placeholder"
        :disabled="node.disabled" v-model="model" />
      <slot name="field_action"></slot>
    </div>
    <input v-else type="date" class="input input-bordered w-full" :placeholder="node.placeholder"
      :disabled="node.disabled" v-model="model" />
  </template>

  <template v-else-if="node.template === 'file'">
    <label class="label">
      <span class="label-text">{{ node.label }}</span>
    </label>
    <div v-if="$slots.field_action" class="join">
      <input type="file" class="file-input file-input-bordered w-full join-item" :disabled="node.disabled"
        @change="model = ($event.target as HTMLInputElement).files?.[0] ?? null" />
      <slot name="field_action"></slot>
    </div>
    <input v-else type="file" class="file-input file-input-bordered w-full" :disabled="node.disabled"
      @change="model = ($event.target as HTMLInputElement).files?.[0] ?? null" />
  </template>

  <template v-else-if="node.template === 'select'">
    <label class="label">
      <span class="label-text">{{ node.label }}</span>
    </label>
    <div v-if="$slots.field_action" class="join">
      <select class="select select-bordered w-full join-item" :disabled="node.disabled" v-model="model">
        <option v-for="option in node.options || []" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <slot name="field_action"></slot>
    </div>
    <select v-else class="select select-bordered w-full" :disabled="node.disabled" v-model="model">
      <option v-for="option in node.options || []" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </template>

  <template v-else-if="node.template === 'checkbox'">
    <label class="cursor-pointer label justify-between">
      <span class="label-text">{{ node.label }}</span>
      <div v-if="$slots.field_action" class="flex gap-2 items-center">
        <input type="checkbox" class="toggle" :disabled="node.disabled" v-model="model" />
        <slot name="field_action"></slot>
      </div>
      <input v-else type="checkbox" class="toggle" :disabled="node.disabled" v-model="model" />
    </label>
  </template>

  <template v-else-if="node.template === 'object'">
    <AutoFormFieldset :node="node" v-model="model">
      <template #legend_action>
        <slot name="field_action" />
      </template>
    </AutoFormFieldset>
  </template>

  <template v-else-if="node.template === 'array'">
    <AutoFormArray :node="node" v-model="model">
      <template #legend_action>
        <slot name="field_action" />
      </template>
    </AutoFormArray>
  </template>

  <template v-else-if="node.template === 'union'">
    <AutoFormUnion :node="node" v-model="model">
      <template #legend_action>
        <slot name="field_action" />
      </template>
    </AutoFormUnion>
  </template>

  <template v-else-if="node.template === 'tuple'">
    <AutoFormTuple :node="node" v-model="model">
      <template #legend_action>
        <slot name="field_action" />
      </template>
    </AutoFormTuple>
  </template>

  <template v-else>
    <div class="text-error">Unsupported template: {{ node.template }}</div>
  </template>
</template>

<script setup lang="ts">
const model = defineModel<any>()
const props = defineProps<{ node: ZFPNode }>()

useSlots()
</script>