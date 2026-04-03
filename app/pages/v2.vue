<template>
  <section class="rounded-box p-4 bg-base-100 flex flex-col gap-4">
    <h1 class="text-2xl font-bold">自动表单 ATF</h1>

    <ATF :schema="schema" v-model="data">
    </ATF>
    <button class="btn btn-primary mt-8"> 提交 </button>
  </section>

  <section class="rounded-box p-4 bg-base-100">
    <pre>{{ data }}</pre>
  </section>
</template>

<script setup lang="ts">
import z4 from 'zod/v4';

const schema = z4.object({
  text: z4.string().default('123').meta({ label: '文本' }),
  obj_arr: z4.object({
    name: z4.string().default('张三').meta({ label: '姓名' }),
    age: z4.number().default(18).meta({ label: '年龄' }),
  })
    .meta({ label: '测试资料' })
    .array()
    .meta({ label: '测试资料数组' }),
  literal: z4.literal(['hello', 'world']).meta({ label: '字面量' }),
  enum: z4.enum(['hello', 'world']).meta({ label: '枚举' })
})
  .meta({ label: '测试对象' })
  .array()
  .meta({ label: '二维数组' })
  .array()
  .meta({ label: '一维数组' })
const data = ref<any>(undefined)
</script>