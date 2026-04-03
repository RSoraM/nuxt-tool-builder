import z4 from "zod/v4";

// ─── Template 分类 ───

export const primitive_templates = ['', 'text', 'textarea', 'number', 'toggle', 'file', 'select'] as const
export const composite_templates = ['object', 'array', 'record', 'tuple', 'template_literal', 'union'] as const
export const unimplemented_templates = ['json'] as const

export type ATFTemplate =
  | typeof primitive_templates[number]
  | typeof composite_templates[number]
  | typeof unimplemented_templates[number]

const _primitiveSet = new Set<string>(primitive_templates)
export const isPrimitiveTemplate = (t: ATFTemplate): t is typeof primitive_templates[number] =>
  _primitiveSet.has(t)

// ─── ATFNode 类型 ───

export interface ATFNode {
  schema: z4.ZodType

  path: string;
  label: string;
  template: ATFTemplate;

  hidden?: boolean;
  disabled?: boolean;
  placeholder?: string;
  autoComplete?: string;

  // object
  props?: { [key: string]: ATFNode }
  // array
  element?: ATFNode
  // tuple
  tuple?: ATFNode[]
  // template literal
  template_literal?: ATFNode[]
  // record
  record?: { key: ATFNode, value: ATFNode }
  // union
  union?: ATFNode[]
  discriminator?: string

  options?: { label: string; value: any }[]

  // 由 unwrap 函数解析得到
  required: boolean
  default?: any
}

declare module 'zod/v4' {
  interface GlobalMeta {
    template?: ATFTemplate;
    label?: string;
    placeholder?: string;
    autoComplete?: string;
    disabled?: boolean;
    hidden?: boolean;
  }
}