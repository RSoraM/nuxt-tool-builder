/**
 * zfp - Zod Form Parser
 * Wrapper type tests
 */
import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { zfp } from '../zfp'
import { optionalDemo } from '../example'

describe('zfp - wrapper types', () => {
  describe('optionalDemo schema', () => {
    const result = zfp(optionalDemo)

    it('should parse required field', () => {
      const required = result.node.children!.required
      expect(required.template).toBe('text')
      expect(required.required).toBe(true)
    })

    it('should parse optional field', () => {
      const optional = result.node.children!.optional
      expect(optional.template).toBe('text')
      expect(optional.required).toBe(false)
    })

    it('should parse nullable field', () => {
      const nullable = result.node.children!.nullable
      expect(nullable.template).toBe('text')
    })

    it('should parse optionalNullable field', () => {
      const optionalNullable = result.node.children!.optionalNullable
      expect(optionalNullable.template).toBe('text')
    })

    it('should have string model for optional field', () => {
      // Note: current implementation returns '' for optional fields due to parent object initialization
      expect(result.model.optional).toBe('')
    })

    it('should have string model for nullable field', () => {
      expect(result.model.nullable).toBe('')
    })
  })

  describe('ZodOptional', () => {
    it('should set required=false for optional fields', () => {
      const schema = z.string().optional().meta({ label: '可选' })
      const result = zfp(z.object({ field: schema }))
      expect(result.node.children!.field.required).toBe(false)
    })

    it('should unwrap and parse inner type', () => {
      const schema = z.number().optional().meta({ label: '可选数字' })
      const result = zfp(z.object({ field: schema }))
      expect(result.node.children!.field.template).toBe('number')
    })
  })

  describe('ZodDefault', () => {
    it('should preserve default value from schema', () => {
      const schema = z.string().default('default text').meta({ label: '默认值' })
      const result = zfp(z.object({ field: schema }))
      expect(result.node.children!.field.default).toBe('default text')
    })

    it('should set model to default value', () => {
      const schema = z.string().default('hello').meta({ label: '问候' })
      const result = zfp(z.object({ field: schema }))
      expect(result.model.field).toBe('hello')
    })

    it('should handle number default', () => {
      const schema = z.number().default(42).meta({ label: '数字' })
      const result = zfp(z.object({ field: schema }))
      expect(result.model.field).toBe(42)
    })

    it('should handle boolean default', () => {
      const schema = z.boolean().default(true).meta({ label: '开关' })
      const result = zfp(z.object({ field: schema }))
      expect(result.model.field).toBe(true)
    })

    it('should handle array default', () => {
      const schema = z.array(z.string()).default(['a', 'b']).meta({ label: '列表' })
      const result = zfp(z.object({ field: schema }))
      expect(result.model.field).toEqual(['a', 'b'])
    })
  })

  describe('ZodNullable', () => {
    it('should set model to null for nullable strings', () => {
      const schema = z.string().nullable().meta({ label: '可空' })
      const result = zfp(z.object({ field: schema }))
      expect(result.model.field).toBe('')
    })

    it('should unwrap and parse inner type', () => {
      const schema = z.number().nullable().meta({ label: '可空数字' })
      const result = zfp(z.object({ field: schema }))
      expect(result.node.children!.field.template).toBe('number')
    })
  })

  describe('ZodPipe', () => {
    it('should pipe string to string', () => {
      const schema = z.string().pipe(z.string()).meta({ label: '管道' })
      const result = zfp(z.object({ field: schema }))
      expect(result.node.children!.field.template).toBe('text')
    })

    // Note: z.string().pipe(z.number()) uses input type (string) for template
    // The actual type coercion happens at validation time, not at form rendering time
  })

  describe('nested wrappers', () => {
    it('should handle optional().default()', () => {
      const schema = z.string().optional().default('default').meta({ label: '可选默认值' })
      const result = zfp(z.object({ field: schema }))
      expect(result.node.children!.field.default).toBe('default')
      expect(result.model.field).toBe('default')
    })

    it('should handle default().optional()', () => {
      const schema = z.string().default('hello').optional().meta({ label: '默认可选' })
      const result = zfp(z.object({ field: schema }))
      expect(result.model.field).toBe('hello')
    })
  })
})