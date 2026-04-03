import z4 from "zod/v4";

// 已实现的模板（与 app/components/ATF/Node.vue 的 component_map 对齐）
export const primitive_templates = ['', 'text', 'textarea', 'number', 'toggle', 'file', 'select'] as const
export const composite_templates = ['object', 'array', 'union'] as const

// 未实现的模板（仅在解析阶段出现，暂无对应渲染组件）
export const unimplemented_templates = ['record', 'tuple', 'template_literal', 'json'] as const

export type ATFPrimitiveTemplate = typeof primitive_templates[number]
export type ATFCompositeTemplate = typeof composite_templates[number]
export type ATFUnimplementedTemplate = typeof unimplemented_templates[number]
export type ATFTemplate = ATFPrimitiveTemplate | ATFCompositeTemplate | ATFUnimplementedTemplate

const primitive_template_set = new Set<ATFTemplate>(primitive_templates)

export const isPrimitiveTemplate = (template: ATFTemplate): template is ATFPrimitiveTemplate =>
  primitive_template_set.has(template)

export const is_primitive_template = isPrimitiveTemplate

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
  // union & discriminated union
  union?: { label: string; value: any, node: ATFNode }[]
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

export const atf_templates = {
  all: [...primitive_templates, ...composite_templates, ...unimplemented_templates],
  primitive: primitive_templates,
  composite: composite_templates,
  unimplemented: unimplemented_templates,
} as const