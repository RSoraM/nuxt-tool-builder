<template>
  <fieldset class="fieldset border border-base-300 rounded-box p-4">
    <legend class="fieldset-legend w-full justify-between">
      <span>{{ node.label }}</span>
      <slot name="legend_action"></slot>
      <button type="button" class="btn btn-primary btn-sm" @click="add">
        添加
      </button>
    </legend>

    <p v-for="msg in errors?.errors" :key="msg" class="text-error text-sm">{{ msg }}</p>

    <template v-if="element">
      <template v-if="element.template === 'object'">
        <AutoFormFieldset v-for="(value, index) in model as any[]" :key="index" :node="element"
          :errors="errors?.items?.[index]" v-model="model[index]">
          <template #legend_action>
            <button class="btn btn-error btn-sm" @click="remove(index)">删除</button>
          </template>
        </AutoFormFieldset>
      </template>

      <template v-else-if="element.template === 'array'">
        <AutoFormArray v-for="(value, index) in model as any[]" :key="index" :node="element"
          :errors="errors?.items?.[index]" v-model="model[index]">
          <template #legend_action>
            <button class="btn btn-error btn-sm" @click="remove(index)">删除</button>
          </template>
        </AutoFormArray>
      </template>

      <template v-else>
        <AutoFormField v-for="(value, index) in model as any[]" :key="index" :node="element"
          :errors="errors?.items?.[index]" v-model="model[index]">
          <template #field_action>
            <button class="btn btn-error join-item" @click="remove(index)">删除</button>
          </template>
        </AutoFormField>
      </template>
    </template>

    <template v-else>
      <p>Element Not exist</p>
    </template>

  </fieldset>
</template>

<script setup lang="ts">
const model = defineModel<any>()
const props = defineProps<{ node: ZFPNode, errors?: ErrorTree }>()

const element = computed(() => props.node.element)

const add = () => model.value.push(structuredClone(props.node.element?.default))
const remove = (index: number) => model.value.splice(index, 1)
</script>