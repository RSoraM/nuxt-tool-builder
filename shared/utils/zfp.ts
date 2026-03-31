import { z } from 'zod';

export type TamplateType =
  | ''                  // 包裹器没有前端组件模板
  | 'text'              // 单行文本输入
  | 'number'            // 数字输入
  | 'bigint'            // 大整数输入
  | 'password'          // 密码输入
  | 'textarea'          // 多行文本输入
  | 'template_literal'  // 模板字符串输入
  | 'checkbox'          // toggle 开关
  | 'date'              // 日期输入
  | 'select'            // 下拉选择
  | 'file'              // 文件上传
  | 'array'             // 数组类型，前端展示为可增删的列表
  | 'object'            // 对象类型，前端展示为嵌套表单
  | 'json';             // json 类型，前端展示为多行文本输入，输入内容必须是合法的 JSON 字符串

/** zod 表单节点 */
export interface ZFPNode {
  label: string;
  path: string;
  /**
   * textarea: 多行文本输入
   * text: 单行文本输入
   * password: 密码输入
   * number: 数字输入
   * bigint: 大整数输入
   * checkbox: toggle 开关
   * date: 日期输入
   * select: 下拉选择
   * file: 文件上传
   * array: 数组类型，前端展示为可增删的列表
   * object: 对象类型，前端展示为嵌套表单
   * lazy: json 类型，前端展示为多行文本输入，输入内容必须是合法的 JSON 字符串
   */
  template: TamplateType;
  required: boolean;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
  // 用于 object 类型
  children?: {
    [key: string]: ZFPNode
  };
  // 用于 array 类型
  element?: ZFPNode;
  // 用于 select 类型
  options?: { label: string; value: any }[];
  // 默认值
  default?: any;
}

declare module 'zod/v4' {
  interface GlobalMeta {
    template?: TamplateType;
    label?: string;
    placeholder?: string;
    autoComplete?: string;
    disabled?: boolean;
  }
}

/** 路由 schema 到对应的 ZFPNode */
const parse_schema = (schema: any, model: any, node?: ZFPNode) => {

  /* 原型类型 ===================================================================== */

  if (schema instanceof z.ZodString) {
    const meta = schema.meta()
    node = node || {
      label: 'text',
      path: '',
      template: 'text',
      required: false,
    }
    node.label = meta?.label || node.label || 'text'
    node.template = meta?.template || node.template || 'text'
    node.placeholder = meta?.placeholder || node.placeholder
    node.autoComplete = meta?.autoComplete || node.autoComplete
    node.disabled = meta?.disabled || node.disabled

    model = model || ''

    return { node, model }
  }

  if (schema instanceof z.ZodStringFormat) {
    const meta = schema.meta()
    node = node || {
      label: 'text',
      path: '',
      template: 'text',
      required: false,
    }
    node.label = meta?.label || node.label || 'text'
    node.template = meta?.template || node.template || 'text'
    node.placeholder = meta?.placeholder || node.placeholder
    node.autoComplete = meta?.autoComplete || node.autoComplete
    node.disabled = meta?.disabled || node.disabled

    model = model || ''

    return { node, model }

  }

  if (schema instanceof z.ZodNumber) {
    const meta = schema.meta()
    node = node || {
      label: 'number',
      path: '',
      template: 'number',
      required: false,
    }
    node.label = meta?.label || node.label || 'number'
    node.template = meta?.template || node.template || 'number'
    node.placeholder = meta?.placeholder || node.placeholder
    node.autoComplete = meta?.autoComplete || node.autoComplete
    node.disabled = meta?.disabled || node.disabled

    model = model || 0

    return { node, model }
  }

  if (schema instanceof z.ZodBigInt) {
    const meta = schema.meta()
    node = node || {
      label: 'bigint',
      path: '',
      template: 'bigint',
      required: false,
    }
    node.label = meta?.label || node.label || 'bigint'
    node.template = meta?.template || node.template || 'bigint'
    node.placeholder = meta?.placeholder || node.placeholder
    node.autoComplete = meta?.autoComplete || node.autoComplete
    node.disabled = meta?.disabled || node.disabled

    model = model || 0n

    return { node, model }
  }

  if (schema instanceof z.ZodBoolean) {
    const meta = schema.meta()
    node = node || {
      label: 'checkbox',
      path: '',
      template: 'checkbox',
      required: false,
    }
    node.label = meta?.label || node.label || 'checkbox'
    node.template = meta?.template || node.template || 'checkbox'
    node.placeholder = meta?.placeholder || node.placeholder
    node.autoComplete = meta?.autoComplete || node.autoComplete
    node.disabled = meta?.disabled || node.disabled

    model = model || false

    return { node, model }
  }

  if (schema instanceof z.ZodDate) {
    const meta = schema.meta()
    node = node || {
      label: 'date',
      path: '',
      template: 'date',
      required: false,
    }
    node.label = meta?.label || node.label || 'date'
    node.template = meta?.template || node.template || 'date'
    node.placeholder = meta?.placeholder || node.placeholder
    node.autoComplete = meta?.autoComplete || node.autoComplete
    node.disabled = meta?.disabled || node.disabled

    model = model || new Date()

    return { node, model }
  }

  if (schema instanceof z.ZodEnum) {
    const meta = schema.meta()
    node = node || {
      label: 'select',
      path: '',
      template: 'select',
      required: false,
    }
    node.label = meta?.label || node.label || 'select'
    node.template = meta?.template || node.template || 'select'
    node.placeholder = meta?.placeholder || node.placeholder
    node.autoComplete = meta?.autoComplete || node.autoComplete
    node.disabled = meta?.disabled || node.disabled

    node.options = schema.options.map(
      (value) => ({ label: `${value}`, value: value })
    )

    model = model || schema.options[0]

    return { node, model }
  }

  if (schema instanceof z.ZodLazy) {
    const meta = schema.meta()
    node = node || {
      label: 'json',
      path: '',
      template: 'json',
      required: false,
    }
    node.label = meta?.label || node.label || 'json'
    node.template = meta?.template || node.template || 'json'
    node.placeholder = meta?.placeholder || node.placeholder
    node.autoComplete = meta?.autoComplete || node.autoComplete
    node.disabled = meta?.disabled || node.disabled

    model = model || ''

    return { node, model }
  }

  if (schema instanceof z.ZodFile) {
    const meta = schema.meta()
    node = node || {
      label: 'file',
      path: '',
      template: 'file',
      required: false,
    }
    node.label = meta?.label || node.label || 'file'
    node.template = meta?.template || node.template || 'file'
    node.placeholder = meta?.placeholder || node.placeholder
    node.autoComplete = meta?.autoComplete || node.autoComplete
    node.disabled = meta?.disabled || node.disabled

    model = model || null

    return { node, model }
  }

  if (schema instanceof z.ZodLiteral) {
    const meta = schema.meta()
    node = node || {
      label: 'text',
      path: '',
      template: 'text',
      required: false,
    }
    node.label = meta?.label || node.label || 'text'
    node.template = meta?.template || node.template || 'text'
    node.placeholder = meta?.placeholder || node.placeholder
    node.autoComplete = meta?.autoComplete || node.autoComplete
    node.disabled = true
    node.default = schema.value

    model = model || schema.value

    return { node, model }
  }

  /* 包裹器 ====================================================================== */

  if (schema instanceof z.ZodOptional) {
    node = node || {
      label: '',
      path: '',
      template: '', // optional 类型不直接对应前端组件，具体展示由内部类型决定
      required: false,
    }
    node.required = false
    model = model || undefined
    schema = schema.unwrap()

    return parse_schema(schema, model, node)
  }

  if (schema instanceof z.ZodNonOptional) {
    node = node || {
      label: '',
      path: '',
      template: '', // nonoptional 类型不直接对应前端组件，具体展示由内部类型决定
      required: true,
    }
    node.required = true
    model = model || undefined
    schema = schema.unwrap()

    return parse_schema(schema, model, node)
  }

  if (schema instanceof z.ZodDefault) {
    node = node || {
      label: '',
      path: '',
      template: '', // default 类型不直接对应前端组件，具体展示由内部类型决定
      required: false,
    }
    node.required = false
    node.default = schema.def.defaultValue
    model = model || schema.def.defaultValue
    schema = schema.unwrap()

    return parse_schema(schema, model, node)
  }

  if (schema instanceof z.ZodNullable) {
    node = node || {
      label: '',
      path: '',
      template: '', // nullable 类型不直接对应前端组件，具体展示由内部类型决定
      required: false,
    }
    node.required = false
    model = model || null
    schema = schema.unwrap()

    return parse_schema(schema, model, node)
  }

  if (schema instanceof z.ZodPipe) {
    schema = schema.def.in
    return parse_schema(schema, model, node)
  }

  /* 嵌套类型 ===================================================================== */

  if (schema instanceof z.ZodDiscriminatedUnion) {
    // TODO
  }

  if (schema instanceof z.ZodUnion) {
    // TODO
  }

  if (schema instanceof z.ZodIntersection) {
    // TODO
  }

  if (schema instanceof z.ZodTuple) {
    // TODO
  }

  if (schema instanceof z.ZodRecord) {
    // TODO
  }

  if (schema instanceof z.ZodSet) {
    // TODO
  }

  if (schema instanceof z.ZodTemplateLiteral) {
    // TODO: 解析模板字符串类型，生成对应的输入组件
  }

  if (schema instanceof z.ZodObject) {
    const meta = schema.meta()
    node = node || {
      label: 'object',
      path: '',
      template: 'object',
      required: false,
    }
    node.label = meta?.label || node.label || 'object'
    node.template = meta?.template || node.template || 'object'
    node.placeholder = meta?.placeholder || node.placeholder
    node.autoComplete = meta?.autoComplete || node.autoComplete
    node.children = node.children || {}

    model = model || {}

    const shape = schema.shape
    for (const field in shape) {
      const fieldSchema = shape[field]
      const fieldSchemaMeta = fieldSchema.meta()
      const { node: fieldNode, model: fieldModel } = parse_schema(shape[field], model[field])
      fieldNode.label = fieldSchemaMeta?.label || field
      fieldNode.path = node.path ? `${node.path}.${field}` : field

      node.children[field] = fieldNode
      model[field] = fieldModel
    }

    return { node, model }
  }

  if (schema instanceof z.ZodArray) {
    const meta = schema.meta()
    node = node || {
      label: 'array',
      path: '',
      template: 'array',
      required: false,
    }
    node.label = meta?.label || node.label || 'array'
    node.template = meta?.template || node.template || 'array'
    node.placeholder = meta?.placeholder || node.placeholder
    node.autoComplete = meta?.autoComplete || node.autoComplete

    const elementSchema = schema.unwrap()
    const { node: elementNode, model: elementModel } = parse_schema(elementSchema, undefined)
    elementNode.path = node.path ? `${node.path}[]` : '[]'
    elementNode.default = elementModel

    model = model || [elementModel]
    node.element = elementNode

    return { node, model }
  }



  throw new Error('This schema cannot be represented in ZFPNode', { cause: schema })
}

export const zfp = (schema: z.ZodObject) => {
  const { node, model } = parse_schema(schema, {})
  return { node, model: structuredClone(model) }
}

/**
 * 
 * Zod 类型继承结构
 * 
- $ZodType
  - $ZodString
    - $ZodStringFormat
  - $ZodNumber
    - $ZodNumberFormat
  - $ZodBigInt
    - $ZodBigIntFormat
  - $ZodBoolean
  - $ZodSymbol
  - $ZodUndefined
  - $ZodNull
  - $ZodAny
  - $ZodUnknown
  - $ZodNever
  - $ZodVoid
  - $ZodDate
  - $ZodArray
  - $ZodObject
  - $ZodUnion
    - $ZodXor
    - $ZodDiscriminatedUnion
  - $ZodIntersection
  - $ZodTuple
  - $ZodRecord
  - $ZodMap
  - $ZodSet
  - $ZodEnum
  - $ZodLiteral
  - $ZodFile
  - $ZodTransform
  - $ZodOptional
  - $ZodNullable
  - $ZodDefault
  - $ZodPrefault
  - $ZodNonOptional
  - $ZodSuccess
  - $ZodCatch
  - $ZodNaN
  - $ZodPipe
    - $ZodCodec
  - $ZodReadonly
  - $ZodTemplateLiteral
  - $ZodCustom
 */