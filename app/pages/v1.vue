<template>
  <section class="card bg-base-100 shadow-lg">
    <div class="card-body space-y-4">
      <h1 class="card-title text-2xl">Zod 动态表单示例</h1>
      <p class="text-sm text-base-content/70">
        该页面由 schema 自动生成字段，支持嵌套对象、数组、联合类型等复杂结构。
      </p>

      <!-- Schema selector tabs -->
      <div role="tablist" class="tabs tabs-border">
        <button v-for="(item, index) in ZFPList" :key="item.name" type="button" role="tab" class="tab"
          :class="{ 'tab-active': activeZFP === index }" @click="activeZFP = index">
          {{ item.label }}
        </button>
      </div>

      <!-- Active schema form -->
      <AutoForm v-if="currentZFP" :node="currentZFP.node" :error="currentError" v-model="currentZFP.data">
        <button type="button" class="btn btn-primary mt-4" @click="handleSubmit">
          提交
        </button>
      </AutoForm>

    </div>
  </section>

  <!-- Schema info -->
  <section class="card bg-base-100 shadow">
    <div class="card-body">
      <h2 class="font-semibold">{{ currentZFP?.label }} - Node 结构</h2>
      <details class="collapse bg-base-200">
        <summary class="collapse-title">查看 Node</summary>
        <pre
          class="collapse-content text-xs overflow-auto max-h-96">{{ JSON.stringify(currentZFP?.node, null, 2) }}</pre>
      </details>
      <details class="collapse bg-base-200 mt-2">
        <summary class="collapse-title">查看 Model</summary>
        <pre
          class="collapse-content text-xs overflow-auto max-h-96">{{ JSON.stringify(currentZFP?.data, bigintReplacer, 2) }}</pre>
      </details>
    </div>
  </section>
</template>

<script setup lang="ts">
import { z } from 'zod/v4'

const ZFPList = [
  { name: 'primitiveForm', label: '基础字段', schema: primitiveForm },
  { name: 'collectionForm', label: '容器类型', schema: collectionForm },
  { name: 'unionForm', label: '联合与组合', schema: unionForm },
].map((item) => {
  const { node, model, } = zfp(item.schema)
  return { ...item, node, data: reactive(model) }
})

const activeZFP = ref(0)
const currentZFP = computed(() => ZFPList[activeZFP.value])
const currentSchema = computed(() => currentZFP.value?.schema)
const currentData = computed(() => currentZFP.value?.data)
const currentError = ref<z.ZodError | undefined>(undefined)

watch(
  currentData,
  () => {
    currentError.value = undefined
    if (!currentZFP.value) return
    const converted = convertModel(currentZFP.value.node, currentData.value)
    const result = currentSchema.value?.safeParse(converted)
    currentError.value = result?.error
  },
  { deep: true, immediate: true }
)

const handleSubmit = () => {
  if (currentError.value || !currentZFP.value) return
  const converted = convertModel(currentZFP.value.node, currentData.value)
  const result = currentSchema.value?.safeParse(converted)
  console.log(result)
}

const bigintReplacer = (_key: string, value: any) => {
  if (typeof value === 'bigint') return value.toString()
  return value
}
</script>