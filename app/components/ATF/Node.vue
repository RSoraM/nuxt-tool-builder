<template>

</template>

<script setup lang="ts">
import z4 from 'zod/v4';

const data = defineModel()
const {
  schema,
  is_root = true,
  path = '',
  label = '表单',
} = defineProps<{
  schema: z4.ZodType,
  is_root?: boolean,
  path?: string
  label?: string
}>()

const node: ATFNode = {
  schema,

  path,
  label,
  template: '',
  required: false,
}

const unwrap = (schema: any): z4.ZodType => {
  if (schema instanceof z4.ZodOptional) {
    node.required = false
    return unwrap(schema.unwrap())
  }
  if (schema instanceof z4.ZodNonOptional) {
    node.required = true
    return unwrap(schema.unwrap())
  }
  if (schema instanceof z4.ZodDefault) {
    node.required = false
    node.default = node.default || schema.def.defaultValue
    return unwrap(schema.unwrap())
  }
  if (schema instanceof z4.ZodNullable) {
    node.required = false
    node.default = node.default || null
    return unwrap(schema.unwrap())
  }
  if (schema instanceof z4.ZodPipe) {
    return unwrap(schema.def.in)
  }

  return schema
}
const unwrapped_schema = unwrap(schema)

const is_primitive = ref(true)
const to_node = (schema: any) => {
  // 原型表单项
  is_primitive.value = true
  if (schema instanceof z4.ZodString) return
  if (schema instanceof z4.ZodStringFormat) return
  if (schema instanceof z4.ZodNumber) return
  if (schema instanceof z4.ZodBigInt) return
  if (schema instanceof z4.ZodBoolean) return
  if (schema instanceof z4.ZodDate) return
  if (schema instanceof z4.ZodLazy) return
  if (schema instanceof z4.ZodFile) return
  if (schema instanceof z4.ZodEnum) return
  if (schema instanceof z4.ZodLiteral) return
  if (schema instanceof z4.ZodTemplateLiteral) return

  // 嵌合表单项
  is_primitive.value = false
  if (schema instanceof z4.ZodTuple) return
  if (schema instanceof z4.ZodArray) return
  if (schema instanceof z4.ZodRecord) return
  if (schema instanceof z4.ZodObject) return

  if (schema instanceof z4.ZodUnion) return
  if (schema instanceof z4.ZodDiscriminatedUnion) return

  if (schema instanceof z4.ZodXor) throw new Error(`不支持的 Zod 类型: ${schema.def.type}, 推荐使用 .ZodDiscriminatedUnion() 明确定义`)
  if (schema instanceof z4.ZodIntersection) throw new Error(`不支持的 Zod 类型: ${schema.def.type}, 无法确定表单结构, 推荐使用 .extend() 明确定义`)

  throw new Error(`不支持的 Zod 类型: ${schema.def.type}`)
}

interface ATFNode {
  schema: z4.ZodType

  path: string;
  label: string;
  template: string
  required: boolean

  hidden?: boolean;
  disabled?: boolean;
  placeholder?: string;
  autoComplete?: string;

  children?: { [key: string]: ATFNode }
  tuple?: ATFNode[]
  element?: ATFNode
  options?: { label: string; value: any }[]

  default?: any
}
</script>