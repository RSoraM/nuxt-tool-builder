import z4 from "zod/v4";

export interface ATFNode {
  schema: z4.ZodType

  path: string;
  label: string;
  template: typeof atf_templates.all[number];

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
    template?: typeof atf_templates.all[number];
    label?: string;
    placeholder?: string;
    autoComplete?: string;
    disabled?: boolean;
    hidden?: boolean;
  }
}

// 已实现的模板（与 app/components/ATF/Node.vue 的 component_map 对齐）
export const primitive_templates = ['', 'text', 'textarea', 'number', 'toggle', 'file', 'select'] as const
export const composite_templates = ['object', 'array'] as const

// 未实现的模板（仅在解析阶段出现，暂无对应渲染组件）
export const unimplemented_templates = ['record', 'tuple', 'union', 'template_literal', 'json'] as const

export const atf_templates = {
  all: [...primitive_templates, ...composite_templates, ...unimplemented_templates],
  primitive: primitive_templates,
  composite: composite_templates,
  unimplemented: unimplemented_templates,
} as const