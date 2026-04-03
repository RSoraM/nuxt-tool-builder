<template>
  <section class="rounded-box p-4 bg-base-100 flex flex-col gap-4">
    <ATF :schema="json_schema" v-model="data">
    </ATF>
    <button class="btn btn-primary mt-8" @click="handle_submit"> 提交 </button>
  </section>

  <section class="rounded-box p-4 bg-base-100">
    <pre class="font-mono">{{ data }}</pre>
  </section>
</template>

<script setup lang="ts">
import z4 from 'zod/v4';

const json_schema = z4.json().meta({ label: 'JSON编辑器', template: 'codemirror' })

const schema = z4.object({
  text: z4.string().nonempty().default('hello').meta({ label: '文本' }),
  textarea: z4.string().meta({ label: '长文本', template: 'textarea' }).default(''),
  number: z4.number().default(42).meta({ label: '数字' }),
  toggle: z4.boolean().default(false).meta({ label: '开关' }),
  select: z4.enum(['选项A', '选项B', '选项C']).default('选项A').meta({ label: '单选' }),

  nested: z4.object({
    name: z4.string().default('嵌套').meta({ label: '名称' }),
    count: z4.number().default(0).meta({ label: '数量' }),
  }).meta({ label: '嵌套对象' }),

  list: z4.array(
    z4.string().default('').meta({ label: '项' })
  ).default(['默认项']).meta({ label: '数组' }),

  tuple: z4.tuple([
    z4.string().default('第一').meta({ label: '第一项' }),
    z4.number().default(100).meta({ label: '第二项' }),
    z4.boolean().default(true).meta({ label: '第三项' }),
  ]).meta({ label: '元组' }),

  record: z4.record(
    z4.string(),
    z4.number().default(0).meta({ label: '值' }),
  ).meta({ label: '字典' }),

  union: z4.union([
    z4.object({
      type: z4.literal('text').meta({ label: '类型' }),
      content: z4.string().default('').meta({ label: '内容' }),
    }).meta({ label: '文本类型' }),
    z4.object({
      type: z4.literal('number').meta({ label: '类型' }),
      value: z4.number().default(0).meta({ label: '值' }),
    }).meta({ label: '数字类型' }),
  ]).meta({ label: '联合类型' }),

  nested_union: z4.union([
    z4.object({
      type: z4.literal('option1').meta({ label: '类型' }),
      value: z4.string().default('选项1的值').meta({ label: '值' }),
    }).meta({ label: '选项1' }),
    z4.object({
      type: z4.literal('option2').meta({ label: '类型' }),
      value: z4.union([
        z4.object({
          type: z4.literal('text').meta({ label: '类型' }),
          content: z4.string().default('').meta({ label: '内容' }),
        }).meta({ label: '文本类型' }),
        z4.object({
          type: z4.literal('number').meta({ label: '类型' }),
          value: z4.number().default(0).meta({ label: '值' }),
        }).meta({ label: '数字类型' }),
      ]).meta({ label: '值' }),
    }).meta({ label: '选项2' }),
  ]).meta({ label: '嵌套联合类型' }),

  discriminated: z4.discriminatedUnion('kind', [
    z4.object({
      kind: z4.literal('circle'),
      radius: z4.number().default(10).meta({ label: '半径' }),
    }).meta({ label: '圆形' }),
    z4.object({
      kind: z4.literal('rect'),
      width: z4.number().default(20).meta({ label: '宽度' }),
      height: z4.number().default(30).meta({ label: '高度' }),
    }).meta({ label: '矩形' }),
  ]).meta({ label: '有判别联合' }),

  nested_discriminated: z4.discriminatedUnion('kind', [
    z4.object({
      kind: z4.literal('option1'),
      value: z4.string().default('选项1的值').meta({ label: '值' }),
    }).meta({ label: '选项1' }),
    z4.object({
      kind: z4.literal('option2'),
      value: z4.discriminatedUnion('type', [
        z4.object({
          type: z4.literal('text').meta({ label: '类型' }),
          content: z4.string().default('').meta({ label: '内容' }),
        }).meta({ label: '文本类型' }),
        z4.object({
          type: z4.literal('number').meta({ label: '类型' }),
          value: z4.number().default(0).meta({ label: '值' }),
        }).meta({ label: '数字类型' }),
      ]).meta({ label: '值' }),
    }).meta({ label: '选项2' }),
  ]).meta({ label: '嵌套有判别联合' }),
}).meta({ label: '测试表单' })

const data = ref<any>(undefined)

const handle_submit = () => {
  console.log('submit', data.value)
}
</script>