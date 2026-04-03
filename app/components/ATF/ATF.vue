<template>
  <template v-if="available">
    <form @submit.prevent="">
      <template v-if="is_root && is_root_primitive">
        <ATFFieldset :legend="label">
          <ATFNode :node="node!" v-model="data" />

          <pre v-if="error" class="mt-4 text-sm text-error">{{ z4.prettifyError(error) }}</pre>
          <template #actions>
            <slot />
          </template>
        </ATFFieldset>
      </template>

      <template v-else>
        <ATFNode :node="node!" v-model="data">

          <pre v-if="error" class="mt-4 text-sm text-error">{{ z4.prettifyError(error) }}</pre>
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
import { cloneDeep } from 'lodash-es'

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

// 可行性验证
const available = computed(() => {
  try {
    schema.toJSONSchema()
    return true
  }
  catch (error) {
    return false
  }
})

// 实时验证
const error = ref<z4.ZodError | undefined>(undefined)
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
    autoComplete: meta?.autoComplete,
    disabled: meta?.disabled,
    hidden: meta?.hidden,
  }

  // Merge wrapper-level meta in an outside-in order: outer wrapper wins, inner wrappers fill gaps.
  node.label = node.label || meta?.label || ''
  node.template = node.template || meta?.template || ''
  node.placeholder = node.placeholder ?? meta?.placeholder
  node.autoComplete = node.autoComplete ?? meta?.autoComplete
  node.disabled = node.disabled ?? meta?.disabled
  node.hidden = node.hidden ?? meta?.hidden

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
    if (node.default === undefined) {
      node.default = cloneDeep(schema.def.defaultValue)
    }
    return unwrap(schema.unwrap(), node)
  }
  if (schema instanceof z4.ZodNullable) {
    node.required = false
    if (node.default === undefined) {
      node.default = null
    }
    return unwrap(schema.unwrap(), node)
  }
  if (schema instanceof z4.ZodPipe) {
    return unwrap(schema.def.in, node)
  }

  return { schema, node }
}

const apply_meta = (
  node: ATFNode,
  meta: any,
  label: string | undefined,
  fallback_label: string,
  fallback_template: typeof atf_templates.all[number]
) => {
  node.label = node.label || meta?.label || label || fallback_label
  node.hidden = node.hidden ?? meta?.hidden ?? false
  node.disabled = node.disabled ?? meta?.disabled ?? false
  node.template = node.template || meta?.template || fallback_template
  node.placeholder = node.placeholder ?? meta?.placeholder
  node.autoComplete = node.autoComplete ?? meta?.autoComplete ?? 'off'
}

// 解析函数
const parse = (schema: any, path?: string, label?: string): ATFNode => {
  const { schema: _, node } = unwrap(schema)

  // 原型表单项
  if (_ instanceof z4.ZodString || _ instanceof z4.ZodStringFormat) {
    node.path = node.path || path || ''

    const meta = _.meta()
    apply_meta(node, meta, label, '字符串', 'text')

    return node
  }
  if (_ instanceof z4.ZodNumber) {
    node.path = node.path || path || ''

    const meta = _.meta()
    apply_meta(node, meta, label, '数字', 'number')

    return node
  }
  if (_ instanceof z4.ZodBoolean) {
    node.path = node.path || path || ''

    const meta = _.meta()
    apply_meta(node, meta, label, '开关', 'toggle')

    return node
  }
  if (_ instanceof z4.ZodFile) {
    node.path = node.path || path || ''

    const meta = _.meta()
    apply_meta(node, meta, label, '文件', 'file')

    return node
  }
  if (_ instanceof z4.ZodEnum) {
    node.path = node.path || path || ''

    const meta = _.meta()
    apply_meta(node, meta, label, '单选', 'select')

    node.options = _.options.map((value) => ({ label: `${value}`, value }))

    return node
  }
  if (_ instanceof z4.ZodLiteral) {
    node.path = node.path || path || ''

    const meta = _.meta()
    apply_meta(node, meta, label, '常量', 'select')

    const values = Array.from(_.values)
    if (node.default === undefined) {
      node.default = values[0]
    }
    node.options = values.map((value) => ({ label: `${value}`, value }))

    return node
  }
  if (_ instanceof z4.ZodTemplateLiteral) {
    node.path = node.path || path || ''

    const meta = _.meta()
    apply_meta(node, meta, label, '模板字符串', 'template_literal')

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
    apply_meta(node, meta, label, 'JSON', 'json')

    return node
  }

  // 嵌合表单项
  if (_ instanceof z4.ZodArray) {
    node.path = node.path || path || ''

    const meta = _.meta()
    apply_meta(node, meta, label, '数组', 'array')

    node.element = parse(_.element, `${node.path}[]`)

    if (node.default === undefined) {
      node.default = node.element.default === undefined
        ? []
        : [cloneDeep(node.element.default)]
    }

    return node
  }
  if (_ instanceof z4.ZodRecord) {
    node.path = node.path || path || ''

    const meta = _.meta()
    apply_meta(node, meta, label, '对象', 'record')


    node.record = {
      key: parse(_.def.keyType, `${node.path}.__key__`),
      value: parse(_.def.valueType, `${node.path}.__value__`),
    }

    return node
  }
  if (_ instanceof z4.ZodObject) {
    node.path = node.path || path || ''

    const meta = _.meta()
    apply_meta(node, meta, label, '对象', 'object')

    node.props = Object.fromEntries(
      Object.entries(_.shape).map(([key, value]) => [key, parse(value, `${node.path}.${key}`, key)])
    )

    if (node.default === undefined) {
      const default_object = Object.fromEntries(
        Object.entries(node.props || {}).map(([key, value]) => [key, value.default])
      )

      node.default = cloneDeep(default_object)
    }

    return node
  }

  // 特殊表单项
  if (_ instanceof z4.ZodTuple) {
    node.path = node.path || path || ''

    const meta = _.meta()
    apply_meta(node, meta, label, '元组', 'tuple')

    node.tuple = _.def.items.map((item, index) => parse(item, `${node.path}[${index}]`))

    return node
  }
  if (_ instanceof z4.ZodUnion) {
    node.path = node.path || path || ''

    const meta = _.meta()
    apply_meta(node, meta, label, '联合', 'union')

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
    apply_meta(node, meta, label, '联合', 'union')

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
  ? isPrimitiveTemplate(node!.template)
  : false
)
</script>