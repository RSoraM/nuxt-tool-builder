<template>
  <template v-if="available">
    <form @submit.prevent="">
      <template v-if="is_root && is_root_primitive">
        <ATFFieldset :legend="label">
          <ATFNode :node="node!" v-model="data" />

          <template #actions>
            <slot />
          </template>
        </ATFFieldset>
      </template>

      <template v-else>
        <ATFNode :node="node!" v-model="data">
          <template #actions>
            <slot />
          </template>
        </ATFNode>
      </template>
    </form>
  </template>

  <template v-else>
    <div class="alert alert-error">
      <span class="icon-[carbon--warning-filled] size-4"></span>
      <div>
        <h3 class="font-bold">不支持的 Zod 类型</h3>
        <div class="text-xs">当前版本的 ATF 仅支持 Zod 4.0 及以上版本，且 schema 必须可以通过 toJSONSchema 方法转换为 JSON Schema。</div>
      </div>
    </div>
  </template>
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
const error = ref<z4.ZodError | undefined>(undefined)

// 可行性验证
const available = ref(true)
try {
  schema.toJSONSchema()
  available.value = true
}
catch (error) {
  available.value = false
}

// 实时验证
watch(
  data,
  () => error.value = schema.safeParse(data.value).error,
  { deep: true, immediate: true }
)

// 去包装函数
const unwrap = (schema: any, node?: ATFNode): { schema: z4.ZodType, node: ATFNode } => {
  if (!(schema instanceof z4.ZodType)) throw new Error(`不支持的 Zod 类型: ${schema}`)
  const meta = schema.meta()
  node = node || {
    schema,

    path: '',
    label: meta?.label || '',
    template: meta?.template || '',
    required: false,

    placeholder: meta?.placeholder,
    autoComplete: meta?.autoComplete || 'off',
    disabled: meta?.disabled || false,
    hidden: meta?.hidden || false,
  }

  if (schema instanceof z4.ZodOptional) {
    node.required = false
    return unwrap(schema.unwrap(), node)
  }
  if (schema instanceof z4.ZodNonOptional) {
    node.required = true
    return unwrap(schema.unwrap(), node)
  }
  if (schema instanceof z4.ZodDefault) {
    node.required = false
    node.default = node.default || schema.def.defaultValue
    return unwrap(schema.unwrap(), node)
  }
  if (schema instanceof z4.ZodNullable) {
    node.required = false
    node.default = node.default || null
    return unwrap(schema.unwrap(), node)
  }
  if (schema instanceof z4.ZodPipe) {
    return unwrap(schema.def.in, node)
  }

  return { schema, node }
}

// 解析函数
const parse = (schema: any, path?: string, label?: string): ATFNode => {
  const { schema: _, node } = unwrap(schema)

  // 原型表单项
  if (_ instanceof z4.ZodString || _ instanceof z4.ZodStringFormat) {
    node.path = node.path || path || ''

    const meta = _.meta()
    node.label = meta?.label || node.label || label || '字符串'
    node.hidden = meta?.hidden || false
    node.disabled = meta?.disabled || false
    node.template = meta?.template || 'string'
    node.placeholder = meta?.placeholder
    node.autoComplete = meta?.autoComplete || 'off'

    return node
  }
  if (_ instanceof z4.ZodNumber) {
    node.path = node.path || path || ''

    const meta = _.meta()
    node.label = meta?.label || node.label || label || '数字'
    node.hidden = meta?.hidden || false
    node.disabled = meta?.disabled || false
    node.template = meta?.template || 'number'
    node.placeholder = meta?.placeholder
    node.autoComplete = meta?.autoComplete || 'off'

    return node
  }
  if (_ instanceof z4.ZodBoolean) {
    node.path = node.path || path || ''

    const meta = _.meta()
    node.label = meta?.label || node.label || label || '开关'
    node.hidden = meta?.hidden || false
    node.disabled = meta?.disabled || false
    node.template = meta?.template || 'toggle'
    node.placeholder = meta?.placeholder
    node.autoComplete = meta?.autoComplete || 'off'

    return node
  }
  if (_ instanceof z4.ZodFile) {
    node.path = node.path || path || ''

    const meta = _.meta()
    node.label = meta?.label || node.label || label || '文件'
    node.hidden = meta?.hidden || false
    node.disabled = meta?.disabled || false
    node.template = meta?.template || 'file'
    node.placeholder = meta?.placeholder
    node.autoComplete = meta?.autoComplete || 'off'

    return node
  }
  if (_ instanceof z4.ZodEnum) {
    node.path = node.path || path || ''

    const meta = _.meta()
    node.label = meta?.label || node.label || label || '单选'
    node.hidden = meta?.hidden || false
    node.disabled = meta?.disabled || false
    node.template = meta?.template || 'select'
    node.placeholder = meta?.placeholder
    node.autoComplete = meta?.autoComplete || 'off'

    node.options = _.options.map((value) => ({ label: `${value}`, value }))

    return node
  }
  if (_ instanceof z4.ZodLiteral) {
    node.path = node.path || path || ''

    const meta = _.meta()
    node.label = meta?.label || node.label || label || '常量'
    node.hidden = meta?.hidden || false
    node.disabled = meta?.disabled || false
    node.template = meta?.template || 'select'
    node.placeholder = meta?.placeholder
    node.autoComplete = meta?.autoComplete || 'off'

    const values = Array.from(_.values)
    node.default = node.default || values[0]
    node.options = values.map((value) => ({ label: `${value}`, value }))

    return node
  }
  if (_ instanceof z4.ZodTemplateLiteral) {
    node.path = node.path || path || ''

    const meta = _.meta()
    node.label = meta?.label || node.label || label || '模板字符串'
    node.hidden = meta?.hidden || false
    node.disabled = meta?.disabled || false
    node.template = meta?.template || 'template_literal'
    node.placeholder = meta?.placeholder
    node.autoComplete = meta?.autoComplete || 'off'

    node.template_literal = _.def.parts.map((part, index) => _ instanceof z4.ZodType
      ? parse(part, node.path)
      : {
        schema: _,

        path: `__skip__${node.path}.${index}`,
        label: '',
        template: 'text',

        disabled: true,
        autoComplete: 'off',

        required: true,
        default: `${part}`,
      }
    )

    return node
  }
  if (_ instanceof z4.ZodLazy) {
    node.path = node.path || path || ''

    const meta = _.meta()
    node.label = meta?.label || node.label || label || 'JSON'
    node.hidden = meta?.hidden || false
    node.disabled = meta?.disabled || false
    node.template = meta?.template || 'json'
    node.placeholder = meta?.placeholder
    node.autoComplete = meta?.autoComplete || 'off'

    return node
  }

  // 嵌合表单项
  if (_ instanceof z4.ZodArray) {
    node.path = node.path || path || ''

    const meta = _.meta()
    node.label = meta?.label || node.label || label || '数组'
    node.hidden = meta?.hidden || false
    node.disabled = meta?.disabled || false
    node.template = meta?.template || 'array'
    node.placeholder = meta?.placeholder
    node.autoComplete = meta?.autoComplete || 'off'

    node.element = parse(_.element, `${node.path}[]`)

    return node
  }
  if (_ instanceof z4.ZodRecord) {
    node.path = node.path || path || ''

    const meta = _.meta()
    node.label = meta?.label || node.label || label || '对象'
    node.hidden = meta?.hidden || false
    node.disabled = meta?.disabled || false
    node.template = meta?.template || 'record'
    node.placeholder = meta?.placeholder
    node.autoComplete = meta?.autoComplete || 'off'


    node.record = {
      key: parse(_.def.keyType, `${node.path}.__key__`),
      value: parse(_.def.valueType, `${node.path}.__value__`),
    }

    return node
  }
  if (_ instanceof z4.ZodObject) {
    node.path = node.path || path || ''

    const meta = _.meta()
    node.label = meta?.label || node.label || label || '对象'
    node.hidden = meta?.hidden || false
    node.disabled = meta?.disabled || false
    node.template = meta?.template || 'object'
    node.placeholder = meta?.placeholder
    node.autoComplete = meta?.autoComplete || 'off'

    node.props = Object.fromEntries(
      Object.entries(_.shape).map(([key, value]) => [key, parse(value, `${node.path}.${key}`, key)])
    )

    node.default = node.default || Object.fromEntries(
      Object.entries(node.props || {}).map(([key, value]) => [key, value.default])
    )

    return node
  }

  // 特殊表单项
  if (_ instanceof z4.ZodTuple) {
    node.path = node.path || path || ''

    const meta = _.meta()
    node.label = meta?.label || node.label || label || '元组'
    node.hidden = meta?.hidden || false
    node.disabled = meta?.disabled || false
    node.template = meta?.template || 'tuple'
    node.placeholder = meta?.placeholder
    node.autoComplete = meta?.autoComplete || 'off'

    node.tuple = _.def.items.map((item, index) => parse(item, `${node.path}[${index}]`))

    return node
  }
  if (_ instanceof z4.ZodUnion) {
    node.path = node.path || path || ''

    const meta = _.meta()
    node.label = meta?.label || node.label || label || '联合'
    node.hidden = meta?.hidden || false
    node.disabled = meta?.disabled || false
    node.template = meta?.template || 'union'
    node.placeholder = meta?.placeholder
    node.autoComplete = meta?.autoComplete || 'off'

    node.union = _.def.options.map((option, index) => ({
      label: `选项 ${index + 1}`,
      value: option,
      node: parse(option, `${node.path}.__option${index}__`),
    }))

    return node
  }
  if (_ instanceof z4.ZodDiscriminatedUnion) {
    node.path = node.path || path || ''

    const meta = _.meta()
    node.label = meta?.label || node.label || label || '联合'
    node.hidden = meta?.hidden || false
    node.disabled = meta?.disabled || false
    node.template = meta?.template || 'union'
    node.placeholder = meta?.placeholder
    node.autoComplete = meta?.autoComplete || 'off'

    // TODO: label 可以更友好一些，解析出 discriminant 的值（嵌套解析）
    node.union = _.def.options.map((option, index) => ({
      label: `选项 ${index + 1}`,
      value: option,
      node: parse(option, `${node.path}.__option${index}__`),
    }))

    return node
  }

  if (_ instanceof z4.ZodXor) throw new Error(`不支持的 Zod 类型: ${_.def.type}, 推荐使用 .ZodDiscriminatedUnion() 明确定义`)
  if (_ instanceof z4.ZodIntersection) throw new Error(`不支持的 Zod 类型: ${_.def.type}, 无法确定表单结构, 推荐使用 .extend() 明确定义`)

  throw new Error(`不支持的 Zod 类型: ${_.def.type}`)
}

// 生成表单树
const node = available.value
  ? parse(schema, path)
  : undefined

// 根节点是否为原型表单项
const is_root_primitive = ref(available.value
  ? primitive_templates.includes(node!.template)
  : false
)
</script>