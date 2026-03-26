import { z } from 'zod/v4'

/* inferface ================================================================ */

type form_field_type = 'text' | 'number' | 'password' | 'select' | 'checkbox' | 'textarea' | 'object' | 'array' | 'discriminated_union'

interface form_field_options {
  label: string
  value: string
}

export interface form_field_config {
  key: string
  path?: string
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
  discriminator?: string
  variants?: Record<string, form_field_config[]>
  variant_defaults?: Record<string, Record<string, unknown>>
}

/**
 * declare zod global meta
 */
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
  return path
    .split('-')
    .filter(Boolean)
    .map(segment => /^\d+$/.test(segment) ? Number(segment) : segment)
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

  if (field.type === 'discriminated_union' && field.variants) {
    const filtered_variants: Record<string, form_field_config[]> = {}
    for (const [key, children] of Object.entries(field.variants)) {
      filtered_variants[key] = children
        .map(filter_visible_field)
        .filter((child): child is form_field_config => child !== null)
    }
    return {
      ...field,
      variants: filtered_variants,
    }
  }

  return field
}

const build_field = (key: string, schema: z.ZodTypeAny, parent_path: string | undefined): form_field_config => {
  const { core, required } = unwrap_schema(schema)
  const parsed_default = schema.safeParse(undefined)
  const default_value = parsed_default.success ? parsed_default.data : undefined
  const meta = schema.meta()?.form ?? {}

  // parent_path === undefined means we are inside an array item template; path won't be pre-computed.
  const path: string | undefined = parent_path === undefined
    ? undefined
    : parent_path ? `${parent_path}-${key}` : key

  const base_config = {
    key,
    path,
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
      children: Object.entries(shape).map(([childKey, childSchema]) => build_field(childKey, childSchema as z.ZodTypeAny, path)),
    }
  }

  if (core instanceof z.ZodArray) {
    return {
      ...base_config,
      type: 'array',
      // Array item template: pass undefined so the item and its descendants have path === undefined
      item: build_field('', core.element as unknown as z.ZodTypeAny, undefined),
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

  if (core instanceof z.ZodDiscriminatedUnion) {
    const discriminator: string = (core as any)._zod.def.discriminator
    const options_arr = (core as any)._zod.def.options as z.ZodObject<any>[]
    const variants: Record<string, form_field_config[]> = {}
    const variant_defaults: Record<string, Record<string, unknown>> = {}

    for (const variant_schema of options_arr) {
      const shape = (variant_schema as z.ZodObject<any>).shape
      const { core: disc_core } = unwrap_schema(shape[discriminator] as z.ZodTypeAny)
      const literal_value = String((disc_core as any)._zod.def.values[0])

      const all_children = Object.entries(shape)
        .filter(([k]) => k !== discriminator)
        .map(([k, s]) => build_field(k, s as z.ZodTypeAny, path))

      variants[literal_value] = all_children

      const vd: Record<string, unknown> = { [discriminator]: literal_value }
      for (const child of all_children) {
        vd[child.key] = build_initial_value(child)
      }
      variant_defaults[literal_value] = vd
    }

    return {
      ...base_config,
      type: 'discriminated_union',
      discriminator,
      variants,
      variant_defaults,
      options: Object.keys(variants).map(key => ({
        label: to_label(key),
        value: key,
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

  if (field.type === 'discriminated_union' && field.variant_defaults) {
    const firstKey = Object.keys(field.variant_defaults)[0] ?? ''
    return structuredClone(field.variant_defaults[firstKey] ?? {})
  }

  return ''
}

/**
 * Main entry: parse root schema shape, recursively generate field tree, filter hidden, compile defaults
 */
export const auto_form_kit = (schema: z.ZodTypeAny): {
  fields: form_field_config[]
  defaults: Record<string, unknown>
} => {
  const { core } = unwrap_schema(schema)

  if (!(core instanceof z.ZodObject)) {
    throw new Error('auto_form_kit requires a ZodObject root schema.')
  }

  const all_fields = Object.entries(core.shape).map(([key, itemSchema]) => build_field(key, itemSchema as z.ZodTypeAny, ''))
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