<template>
  <main class="mx-auto max-w-4xl px-4 py-8 space-y-6">
    <section class="card bg-base-100 shadow-lg">
      <div class="card-body space-y-4">
        <h1 class="card-title text-2xl">Zod 动态表单示例</h1>
        <p class="text-sm text-base-content/70">
          该页面由 schema 自动生成字段，支持嵌套对象、数组、联合类型等复杂结构。
        </p>

        <!-- Schema selector tabs -->
        <div role="tablist" class="tabs tabs-border">
          <button v-for="(item, index) in schemaList" :key="item.name" type="button" role="tab" class="tab"
            :class="{ 'tab-active': activeSchema === index }" @click="activeSchema = index">
            {{ item.label }}
          </button>
        </div>

        <!-- Active schema form -->
        <AutoForm v-if="currentSchema" :node="currentSchema.node" v-model="currentSchema.data">
          <button type="button" class="btn btn-primary mt-4" @click="handleSubmit">
            提交
          </button>
        </AutoForm>

      </div>
    </section>

    <!-- Schema info -->
    <section class="card bg-base-100 shadow">
      <div class="card-body">
        <h2 class="font-semibold">{{ currentSchema?.label }} - Node 结构</h2>
        <details class="collapse bg-base-200">
          <summary class="collapse-title">查看 Node</summary>
          <pre
            class="collapse-content text-xs overflow-auto max-h-96">{{ JSON.stringify(currentSchema?.node, null, 2) }}</pre>
        </details>
        <details class="collapse bg-base-200 mt-2">
          <summary class="collapse-title">查看 Model</summary>
          <pre
            class="collapse-content text-xs overflow-auto max-h-96">{{ JSON.stringify(currentSchema?.data, null, 2) }}</pre>
        </details>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
const schemaList = [
  { name: 'userProfile', label: '用户资料', schema: userProfile },
  { name: 'tagsForm', label: '标签列表', schema: tagsForm },
  { name: 'shippingAddress', label: '收货地址', schema: shippingAddress },
  { name: 'coordinateForm', label: '坐标', schema: coordinateForm },
  { name: 'optionalDemo', label: '可选字段', schema: optionalDemo },
  { name: 'paymentForm', label: '支付方式', schema: paymentForm },
  { name: 'statusSchema', label: '状态表单', schema: statusSchema },
  { name: 'orderForm', label: '完整订单', schema: orderForm },
]

const activeSchema = ref(0)

const schemas = computed(() => schemaList.map((item) => {
  const { node, model } = zfp(item.schema)
  return {
    ...item,
    node,
    data: reactive(model),
  }
}))

const currentSchema = computed(() => schemas.value[activeSchema.value])

const handleSubmit = () => {
  console.log('Submit:', currentSchema.value?.data)
}
</script>