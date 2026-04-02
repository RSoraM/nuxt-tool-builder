import { z } from 'zod';

export type TemplateType =
  | ''                  // 包裹器没有前端组件模板
  | 'text'              // 单行文本输入
  | 'number'            // 数字输入
  | 'bigint'            // 大整数输入
  | 'password'          // 密码输入
  | 'textarea'          // 多行文本输入
  | 'checkbox'          // toggle 开关
  | 'date'              // 日期输入
  | 'select'            // 下拉选择
  | 'file'              // 文件上传
  | 'array'             // 数组类型，前端展示为可增删的列表
  | 'object'            // 对象类型，前端展示为嵌套表单
  | 'tuple'             // 元组类型，固定长度数组
  | 'union'             // 联合类型，前端展示为多选一
  | 'record'            // Record 类型，前端展示为可增删的 key-value 列表
  | 'json';             // json 类型，前端展示为多行文本输入，输入内容必须是合法的 JSON 字符串

/** treeifyError 返回的错误树节点 */
export interface ErrorTree {
  errors: string[];
  properties?: Record<string, ErrorTree>;
  items?: ErrorTree[];
}

/** zod 表单节点 */
export interface ZFPNode {
  label: string;
  path: string;
  template: TemplateType;
  required: boolean;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
  hidden?: boolean;
  // 用于 object / union / tuple 类型
  children?: {
    [key: string]: ZFPNode
  };
  // 用于 array / set / record 类型
  element?: ZFPNode;
  // 用于 select / union 类型
  options?: { label: string; value: any }[];
  // 用于 union 类型：各分支的默认 model
  optionDefaults?: any[];
  // 默认值
  default?: any;
  // 原始 Zod 类型标记（提交前需转换）
  originalType?: 'set' | 'record';
}

declare module 'zod/v4' {
  interface GlobalMeta {
    template?: TemplateType;
    label?: string;
    placeholder?: string;
    autoComplete?: string;
    disabled?: boolean;
    hidden?: boolean;
  }
}

/** 初始化基础节点并应用 meta 信息 */
const applyPrimitive = (
  schema: any, model: any, node: ZFPNode | undefined,
  path: string, template: TemplateType, defaultModel: any, label?: string,
): { node: ZFPNode; model: any } => {
  const meta = schema.meta?.()
  const lbl = label || template
  node = node || { label: lbl, path, template, required: true }
  node.label = meta?.label || node.label || lbl
  node.template = meta?.template || node.template || template
  node.placeholder = meta?.placeholder || node.placeholder
  node.autoComplete = meta?.autoComplete || node.autoComplete
  node.disabled = meta?.disabled || node.disabled
  return { node, model: model || defaultModel }
}

/** 初始化包裹器节点 */
const initWrapperNode = (node: ZFPNode | undefined, path: string): ZFPNode =>
  node || { label: '', path, template: '', required: true }

/** 路由 schema 到对应的 ZFPNode */
const parse_schema = (schema: any, model: any, node?: ZFPNode, path: string = '') => {

  /* 原型类型 ===================================================================== */

  if (schema instanceof z.ZodString) return applyPrimitive(schema, model, node, path, 'text', '')
  if (schema instanceof z.ZodStringFormat) return applyPrimitive(schema, model, node, path, 'text', '')
  if (schema instanceof z.ZodNumber) return applyPrimitive(schema, model, node, path, 'number', 0)
  if (schema instanceof z.ZodBigInt) return applyPrimitive(schema, model, node, path, 'bigint', 0n)
  if (schema instanceof z.ZodBoolean) return applyPrimitive(schema, model, node, path, 'checkbox', false)
  if (schema instanceof z.ZodDate) return applyPrimitive(schema, model, node, path, 'date', new Date().toISOString().slice(0, 10))
  if (schema instanceof z.ZodLazy) return applyPrimitive(schema, model, node, path, 'json', '')
  if (schema instanceof z.ZodFile) return applyPrimitive(schema, model, node, path, 'file', null)

  if (schema instanceof z.ZodEnum) {
    const result = applyPrimitive(schema, model, node, path, 'select', schema.options[0])
    result.node.options = schema.options.map((value: any) => ({ label: `${value}`, value }))
    return result
  }

  if (schema instanceof z.ZodLiteral) {
    const result = applyPrimitive(schema, model, node, path, 'text', schema.value)
    result.node.disabled = true
    result.node.default = schema.value
    return result
  }

  /* 包裹器 ====================================================================== */

  if (schema instanceof z.ZodOptional) {
    node = initWrapperNode(node, path)
    node.required = false
    return parse_schema(schema.unwrap(), model || undefined, node, path)
  }

  if (schema instanceof z.ZodNonOptional) {
    node = initWrapperNode(node, path)
    node.required = true
    return parse_schema(schema.unwrap(), model || undefined, node, path)
  }

  if (schema instanceof z.ZodDefault) {
    node = initWrapperNode(node, path)
    node.required = false
    node.default = schema.def.defaultValue
    return parse_schema(schema.unwrap(), model || schema.def.defaultValue, node, path)
  }

  if (schema instanceof z.ZodNullable) {
    node = initWrapperNode(node, path)
    node.required = false
    return parse_schema(schema.unwrap(), model || null, node, path)
  }

  if (schema instanceof z.ZodPipe) {
    return parse_schema(schema.def.in, model, node, path)
  }

  /* 嵌套类型 ===================================================================== */

  if (schema instanceof z.ZodDiscriminatedUnion) {
    const meta = schema.meta()
    node = node || {
      label: 'union',
      path,
      template: 'union',
      required: true,
    }
    node.label = meta?.label || node.label || 'union'
    node.template = meta?.template || node.template || 'union'
    node.placeholder = meta?.placeholder || node.placeholder
    node.children = node.children || {}

    const options = schema._zod.def.options
    const discriminator = schema._zod.def.discriminator
    node.options = []
    node.optionDefaults = []

    options.forEach((optionSchema: any, index: number) => {
      const discriminatorField = optionSchema.shape?.[discriminator]
      const discriminatorValue = discriminatorField?._zod?.def?.value ?? discriminatorField?.value ?? index
      const optionLabel = optionSchema.meta()?.label || String(discriminatorValue) || String(index)
      const optionPath = node!.path ? `${node!.path}[${index}]` : `[${index}]`

      const { node: optionNode, model: optionModel } = parse_schema(optionSchema, undefined, undefined, optionPath)
      optionNode!.label = optionLabel

      // Hide the discriminator field from children
      if (optionNode!.children && discriminator in optionNode!.children) {
        optionNode!.children[discriminator]!.hidden = true
      }

      // Recursively hide discriminator in nested union options
      function hideDiscriminatorInNestedUnions(n: any, disc: string) {
        if (!n?.children) return
        Object.values(n.children).forEach((child: any) => {
          if (child?.children && disc in child.children) {
            child.children[disc]!.hidden = true
          }
          if (child?.template === 'union') {
            hideDiscriminatorInNestedUnions(child, disc)
          }
        })
      }
      hideDiscriminatorInNestedUnions(optionNode, discriminator)

      node!.children![String(index)] = optionNode!
      node!.options!.push({ label: optionLabel, value: discriminatorValue ?? index })
      node!.optionDefaults!.push(optionModel)
    })

    // model = first option's default
    model = node.optionDefaults[0] ?? {}

    return { node, model }
  }

  if (schema instanceof z.ZodUnion) {
    const meta = schema.meta()
    node = node || {
      label: 'union',
      path,
      template: 'union',
      required: true,
    }
    node.label = meta?.label || node.label || 'union'
    node.template = meta?.template || node.template || 'union'
    node.placeholder = meta?.placeholder || node.placeholder
    node.children = node.children || {}
    node.options = []
    node.optionDefaults = []

    const options = schema._zod.def.options
    options.forEach((optionSchema: any, index: number) => {
      const optionLabel = optionSchema.meta()?.label || String(index)
      const optionPath = node!.path ? `${node!.path}[${index}]` : `[${index}]`

      const { node: optionNode, model: optionModel } = parse_schema(optionSchema, undefined, undefined, optionPath)
      optionNode!.label = optionLabel

      node!.children![String(index)] = optionNode!
      node!.options!.push({ label: optionLabel, value: index })
      node!.optionDefaults!.push(optionModel)
    })

    // model = first option's default
    model = node.optionDefaults[0] ?? {}

    return { node, model }
  }

  if (schema instanceof z.ZodIntersection) {
    const meta = schema.meta()
    node = node || {
      label: 'intersection',
      path,
      template: 'object',
      required: true,
    }
    node.label = meta?.label || node.label || 'intersection'
    node.template = meta?.template || node.template || 'object'
    node.placeholder = meta?.placeholder || node.placeholder
    node.children = node.children || {}
    model = model || {}

    const leftSchema = schema._zod.def.left
    const rightSchema = schema._zod.def.right

    const { node: leftNode, model: leftModel } = parse_schema(leftSchema, model, undefined, node.path)
    Object.assign(node!.children, leftNode!.children || {})
    Object.assign(model, leftModel || {})

    const { node: rightNode, model: rightModel } = parse_schema(rightSchema, model, undefined, node.path)
    Object.assign(node!.children, rightNode!.children || {})
    Object.assign(model, rightModel || {})

    return { node, model }
  }

  if (schema instanceof z.ZodTuple) {
    const meta = schema.meta()
    node = node || {
      label: 'tuple',
      path,
      template: 'tuple',
      required: true,
    }
    node.label = meta?.label || node.label || 'tuple'
    node.template = meta?.template || node.template || 'tuple'
    node.placeholder = meta?.placeholder || node.placeholder
    node.children = node.children || {}
    model = model || []

    const items = schema._zod.def.items
    items.forEach((itemSchema: any, index: number) => {
      const key = String(index)
      const itemPath = node!.path ? `${node!.path}[${key}]` : `[${key}]`
      const { node: itemNode, model: itemModel } = parse_schema(itemSchema, model[index], undefined, itemPath)
      itemNode!.label = itemSchema.meta()?.label || key
      node!.children![key] = itemNode!
      model[index] = itemModel
    })

    return { node, model }
  }

  if (schema instanceof z.ZodRecord) {
    const meta = schema.meta()
    node = node || {
      label: 'record',
      path,
      template: 'record',
      required: true,
    }
    node.label = meta?.label || node.label || 'record'
    node.template = meta?.template || node.template || 'record'
    node.placeholder = meta?.placeholder || node.placeholder
    node.originalType = 'record'
    model = model || {}

    const valueSchema = schema._zod.def.valueType
    const elementPath = node.path ? `${node.path}[]` : '[]'
    const { node: elementNode, model: elementModel } = parse_schema(valueSchema, undefined, undefined, elementPath)
    elementNode!.label = 'value'
    elementNode!.default = elementModel

    node!.element = elementNode!

    return { node, model }
  }

  if (schema instanceof z.ZodSet) {
    const meta = schema.meta()
    node = node || {
      label: 'set',
      path,
      template: 'array',
      required: true,
    }
    node.label = meta?.label || node.label || 'set'
    node.template = meta?.template || node.template || 'array'
    node.placeholder = meta?.placeholder || node.placeholder
    node.originalType = 'set'
    model = model || []

    const valueSchema = schema._zod.def.valueType
    const elementPath = node.path ? `${node.path}[]` : '[]'
    const { node: elementNode, model: elementModel } = parse_schema(valueSchema, undefined, undefined, elementPath)
    elementNode!.label = 'item'
    elementNode!.default = elementModel

    node!.element = elementNode!
    model = [elementModel]

    return { node, model }
  }

  if (schema instanceof z.ZodTemplateLiteral) {
    const defaultStr = schema.def.parts.map((_: any, i: number) => typeof _ === 'string' ? _ : `{${i}}`).join('')
    const result = applyPrimitive(schema, model, node, path, 'text', defaultStr, 'template_literal')
    result.node.default = defaultStr
    return result
  }

  if (schema instanceof z.ZodObject) {
    const meta = schema.meta()
    node = node || {
      label: 'object',
      path,
      template: 'object',
      required: true,
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
      const fieldPath = node.path ? `${node.path}.${field}` : field
      const { node: fieldNode, model: fieldModel } = parse_schema(shape[field], model[field], undefined, fieldPath)
      fieldNode.label = fieldSchemaMeta?.label || field

      node.children[field] = fieldNode
      model[field] = fieldModel
    }

    return { node, model }
  }

  if (schema instanceof z.ZodArray) {
    const meta = schema.meta()
    node = node || {
      label: 'array',
      path,
      template: 'array',
      required: true,
    }
    node.label = meta?.label || node.label || 'array'
    node.template = meta?.template || node.template || 'array'
    node.placeholder = meta?.placeholder || node.placeholder
    node.autoComplete = meta?.autoComplete || node.autoComplete

    const elementSchema = schema.unwrap()
    const elementPath = node.path ? `${node.path}[]` : '[]'
    const { node: elementNode, model: elementModel } = parse_schema(elementSchema, undefined, undefined, elementPath)
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

/** 根据 ZFPNode 树将表单 model 转换回 Zod 可接受的数据（array→Set 等） */
export const convertModel = (node: ZFPNode, data: any): any => {
  if (data == null) return data

  if (node.template === 'object' && node.children) {
    const result: Record<string, any> = {}
    for (const key of Object.keys(node.children)) {
      result[key] = convertModel(node.children[key]!, data[key])
    }
    return result
  }

  if (node.template === 'array' && node.element) {
    if (node.originalType === 'set') {
      return new Set((data as any[]).map(item => convertModel(node.element!, item)))
    }
    return (data as any[]).map(item => convertModel(node.element!, item))
  }

  if (node.template === 'record' && node.element) {
    const result: Record<string, any> = {}
    for (const key of Object.keys(data || {})) {
      result[key] = convertModel(node.element!, data[key])
    }
    return result
  }

  if (node.template === 'tuple' && node.children) {
    const keys = Object.keys(node.children).sort((a, b) => Number(a) - Number(b))
    return keys.map(key => convertModel(node.children![key]!, data[Number(key)]))
  }

  if (node.template === 'union' && node.children) {
    for (const key of Object.keys(node.children)) {
      const child = node.children[key]!
      if (child.template === 'object' || child.template === 'array' || child.template === 'tuple' || child.template === 'record') {
        return convertModel(child, data)
      }
    }
  }

  return data
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