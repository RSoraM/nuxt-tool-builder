import z4 from "zod/v4";

export interface ATFNode {
  schema: z4.ZodType

  path: string;
  label: string;
  template: string

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
    template?: string;
    label?: string;
    placeholder?: string;
    autoComplete?: string;
    disabled?: boolean;
    hidden?: boolean;
  }
}

export const primitive_templates = ['string', 'number', 'boolean', 'toggle', 'file', 'select']
