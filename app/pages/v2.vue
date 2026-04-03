<template>
  <section class="rounded-box p-4 bg-base-100 flex flex-col gap-4">
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

// const schema = z4.string().nonempty().default('123').meta({ label: '文本' })
const schema = z4.object({
  text: z4.string().nonempty().default('123').meta({ label: '文本' }),
  str_arr: z4.string().meta({ template: 'textarea' }).array().meta({ label: '字符串数组' }),
  literal: z4.literal(['hello', 'world']).meta({ label: '字面量' }),
  enum: z4.enum(['hello', 'world']).meta({ label: '枚举' })
})
  .meta({ label: '测试对象' })
  .array()
  .meta({ label: '二维数组' })
  .array()
  .meta({ label: '一维数组' })
const data = ref<any>(undefined)

const handle_submit = () => {
  console.log('submit', data.value)
}
</script>