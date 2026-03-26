import { z } from 'zod/v4'

/* inferface ================================================================ */

type form_field_type = 'text' | 'number' | 'password' | 'select' | 'checkbox' | 'textarea' | 'object' | 'array'

interface form_field_options {
  label: string
  value: string
}

export interface form_field_config {
  key: string
  type: form_field_type
  label: string
  required: boolean
  placeholder?: string
  autocomplete?: string
  options?: form_field_options[]
  hidden?: boolean
  description?: string
  default_value?: unknown
  children?: form_field_config[]
  item?: form_field_config
}

interface auto_form_result {
  fields: form_field_config[]
  defaults: Record<string, unknown>
}

interface auto_form_error_result {
  form_errors: string[]
  field_errors: Record<string, string[]>
}

/* declare zod global meta ========================================================== */

declare module "zod/v4" {
  interface GlobalMeta {
    form?: {
      label?: string
      type?: form_field_type
      placeholder?: string
      autocomplete?: string
      options?: form_field_options[]
      hidden?: boolean
      description?: string
    }
  }
}

/* helper =================================================================== */

const to_label = (value: string) => {
  const clean = value.replace(/[_-]/g, ' ').trim()

  return clean
    ? clean.charAt(0).toUpperCase() + clean.slice(1)
    : 'Element'
}

const parse_path = (path: string) => {
  const tokens: (string | number)[] = []
  const regex = /([^.[\]]+)|(\[(\d+)\])/g
  let match: RegExpExecArray | null

  match = regex.exec(path)
  while (match) {
    if (match[1]) {
      tokens.push(match[1])
    } else if (match[3]) {
      tokens.push(Number(match[3]))
    }
    match = regex.exec(path)
  }

  return tokens
}

const unwrap_schema = (schema: z.ZodTypeAny) => {
  let core = schema
  let required = true
  let changed = true

  while (changed) {
    changed = false

    if (core instanceof z.ZodOptional || core instanceof z.ZodDefault || core instanceof z.ZodNullable) {
      required = false
      if (typeof (core as any).unwrap === 'function') {
        core = (core as any).unwrap()
        changed = true
        continue
      }
    }

    if (typeof (core as any).innerType === 'function') {
      const inner = (core as any).innerType()
      if (inner && inner !== core) {
        core = inner
        changed = true
        continue
      }
    }

    if (typeof (core as any).sourceType === 'function') {
      const source = (core as any).sourceType()
      if (source && source !== core) {
        core = source
        changed = true
      }
    }
  }

  return {
    core,
    required,
  }
}

const filter_visible_field = (field: form_field_config): form_field_config | null => {
  if (field.hidden) {
    return null
  }

  if (field.type === 'object') {
    return {
      ...field,
      children: (field.children ?? [])
        .map(filter_visible_field)
        .filter((child): child is form_field_config => child !== null),
    }
  }

  if (field.type === 'array' && field.item) {
    const item = filter_visible_field(field.item)
    if (!item) {
      return null
    }

    return {
      ...field,
      item,
    }
  }

  return field
}

const build_field = (key: string, schema: z.ZodTypeAny): form_field_config => {
  const { core, required } = unwrap_schema(schema)
  const parsed_default = schema.safeParse(undefined)
  const default_value = parsed_default.success ? parsed_default.data : undefined
  const meta = schema.meta()?.form ?? {}

  const base_config = {
    key,
    label: meta.label ?? to_label(key),
    required,
    placeholder: meta.placeholder,
    autocomplete: meta.autocomplete,
    hidden: meta.hidden,
    description: meta.description,
    default_value,
  }

  if (core instanceof z.ZodObject) {
    const shape = core.shape
    return {
      ...base_config,
      type: 'object',
      children: Object.entries(shape).map(([childKey, childSchema]) => build_field(childKey, childSchema as z.ZodTypeAny)),
    }
  }

  if (core instanceof z.ZodArray) {
    return {
      ...base_config,
      type: 'array',
      item: build_field('', core.element as unknown as z.ZodTypeAny),
    }
  }

  if (core instanceof z.ZodEnum) {
    return {
      ...base_config,
      type: meta.type ?? 'select',
      options: meta.options ?? core.options.map(option => ({
        label: to_label(String(option)),
        value: String(option),
      })),
    }
  }

  const computed_type: form_field_type = core instanceof z.ZodBoolean
    ? 'checkbox'
    : core instanceof z.ZodNumber
      ? 'number'
      : core instanceof z.ZodString
        ? 'text'
        : 'text'

  return {
    ...base_config,
    type: meta.type ?? computed_type,
  }
}

/* main ===================================================================== */

export const get_value_at_path = (target: unknown, path: string) => {
  if (!path) {
    return target
  }

  const tokens = parse_path(path)
  let cursor = target as any

  for (const token of tokens) {
    if (cursor == null) {
      return undefined
    }
    cursor = cursor[token as any]
  }

  return cursor
}

export const set_value_at_path = (target: Record<string, any>, path: string, value: unknown) => {
  const tokens = parse_path(path)
  if (!tokens.length) {
    return
  }

  let cursor: any = target
  for (let i = 0; i < tokens.length - 1; i += 1) {
    const token = tokens[i]
    const nextToken = tokens[i + 1]

    if (cursor[token as any] == null) {
      cursor[token as any] = typeof nextToken === 'number' ? [] : {}
    }
    cursor = cursor[token as any]
  }

  cursor[tokens[tokens.length - 1] as any] = value
}

export const build_initial_value = (field: form_field_config): unknown => {
  if (field.default_value !== undefined) {
    return structuredClone(field.default_value)
  }

  if (field.type === 'checkbox') {
    return false
  }
  if (field.type === 'array') {
    return []
  }
  if (field.type === 'object') {
    const value: Record<string, unknown> = {}
    for (const child of field.children ?? []) {
      value[child.key] = build_initial_value(child)
    }
    return value
  }

  return ''
}

/**
 * Transform Zod error tree into form-consumable structure: root errors + path-mapped field errors
 */
export const zod_error_to_form_errors = (error: z.ZodError): auto_form_error_result => {
  const tree = z.treeifyError(error)
  const result: auto_form_error_result = {
    form_errors: [],
    field_errors: {},
  }

  const collect_tree_errors = (
    node: { errors: string[]; properties?: Record<string, any>; items?: Array<any | undefined> },
    path: string,
    result: auto_form_error_result,
  ) => {
    if (path && node.errors.length) {
      if (!result.field_errors[path]) {
        result.field_errors[path] = []
      }
      result.field_errors[path].push(...node.errors)
    } else if (!path && node.errors.length) {
      result.form_errors.push(...node.errors)
    }

    const append_path = (base: string, segment: string | number) => {
      if (typeof segment === 'number') {
        return `${base}[${segment}]`
      }

      return base ? `${base}.${segment}` : segment
    }

    for (const [key, child] of Object.entries(node.properties ?? {})) {
      if (!child) {
        continue
      }

      collect_tree_errors(child, append_path(path, key), result)
    }

    for (const [index, child] of (node.items ?? []).entries()) {
      if (!child) {
        continue
      }

      collect_tree_errors(child, append_path(path, index), result)
    }
  }

  collect_tree_errors(tree, '', result)

  return result
}

/**
 * Main entry: parse root schema shape, recursively generate field tree, filter hidden, compile defaults
 */
export const auto_form_kit = (schema: z.ZodTypeAny): auto_form_result => {
  const { core } = unwrap_schema(schema)

  if (!(core instanceof z.ZodObject)) {
    throw new Error('auto_form_kit requires a ZodObject root schema.')
  }

  const all_fields = Object.entries(core.shape).map(([key, itemSchema]) => build_field(key, itemSchema as z.ZodTypeAny))
  const fields = all_fields
    .map(filter_visible_field)
    .filter((field): field is form_field_config => field !== null)

  const defaults: Record<string, unknown> = {}
  for (const field of all_fields) {
    defaults[field.key] = build_initial_value(field)
  }

  return {
    fields,
    defaults,
  }
}