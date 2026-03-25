import { z } from 'zod/v4'

export type form_field_type =
  | 'text'
  | 'number'
  | 'password'
  | 'select'
  | 'checkbox'
  | 'textarea'
  | 'object'
  | 'array'

export interface form_field_config {
  key: string
  type: form_field_type
  label: string
  required: boolean
  placeholder?: string
  options?: { label: string; value: string }[]
  default_value?: unknown
  children?: form_field_config[]
  item?: form_field_config
}

export interface auto_form_result {
  fields: form_field_config[]
  defaults: Record<string, unknown>
}

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

const default_from_schema = (schema: z.ZodTypeAny) => {
  const result = schema.safeParse(undefined)
  return result.success ? result.data : undefined
}

const base_type = (schema: z.ZodTypeAny): form_field_type => {
  if (schema instanceof z.ZodBoolean) {
    return 'checkbox'
  }
  if (schema instanceof z.ZodNumber) {
    return 'number'
  }
  if (schema instanceof z.ZodEnum) {
    return 'select'
  }
  if (schema instanceof z.ZodString) {
    return 'text'
  }
  return 'text'
}

const build_field = (key: string, schema: z.ZodTypeAny): form_field_config => {
  const { core, required } = unwrap_schema(schema)
  const default_value = default_from_schema(schema)

  if (core instanceof z.ZodObject) {
    const shape = core.shape
    return {
      key,
      type: 'object',
      label: to_label(key),
      required,
      default_value,
      children: Object.entries(shape).map(([childKey, childSchema]) => build_field(childKey, childSchema as z.ZodTypeAny)),
    }
  }

  if (core instanceof z.ZodArray) {
    return {
      key,
      type: 'array',
      label: to_label(key),
      required,
      default_value,
      item: build_field('', core.element as unknown as z.ZodTypeAny),
    }
  }

  if (core instanceof z.ZodEnum) {
    return {
      key,
      type: 'select',
      label: to_label(key),
      required,
      default_value,
      options: core.options.map(option => ({
        label: to_label(String(option)),
        value: String(option),
      })),
    }
  }

  return {
    key,
    type: base_type(core),
    label: to_label(key),
    required,
    default_value,
  }
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

const build_defaults_from_fields = (fields: form_field_config[]) => {
  const defaults: Record<string, unknown> = {}
  for (const field of fields) {
    defaults[field.key] = build_initial_value(field)
  }
  return defaults
}

export const zod_issue_path_to_string = (path: Array<PropertyKey>) => {
  let result = ''

  for (const part of path) {
    if (typeof part === 'number') {
      result += `[${part}]`
      continue
    }

    if (typeof part === 'symbol') {
      continue
    }

    if (!result) {
      result = part
    } else {
      result += `.${part}`
    }
  }

  return result
}

export const auto_form_kit = (schema: z.ZodTypeAny): auto_form_result => {
  const { core } = unwrap_schema(schema)

  if (!(core instanceof z.ZodObject)) {
    throw new Error('auto_form_kit requires a ZodObject root schema.')
  }

  const fields = Object.entries(core.shape).map(([key, itemSchema]) => build_field(key, itemSchema as z.ZodTypeAny))

  return {
    fields,
    defaults: build_defaults_from_fields(fields),
  }
}