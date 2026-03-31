/**
 * zfp - Zod Form Parser
 * Primitive type tests
 */
import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { zfp } from '../zfp'

describe('zfp - primitive types', () => {
  describe('ZodString', () => {
    it('should parse as text template', () => {
      const schema = z.string().meta({ label: '用户名', placeholder: '请输入' })
      const result = zfp(z.object({ field: schema }))
      expect(result.node.children!.field.template).toBe('text')
    })

    it('should extract label and placeholder', () => {
      const schema = z.string().meta({ label: '邮箱', placeholder: '请输入邮箱' })
      const result = zfp(z.object({ field: schema }))
      expect(result.node.children!.field.label).toBe('邮箱')
      expect(result.node.children!.field.placeholder).toBe('请输入邮箱')
    })

    it('should default model to empty string', () => {
      const result = zfp(z.object({ field: z.string() }))
      expect(result.model.field).toBe('')
    })
  })

  describe('ZodNumber', () => {
    it('should parse as number template', () => {
      const schema = z.number().meta({ label: '年龄' })
      const result = zfp(z.object({ field: schema }))
      expect(result.node.children!.field.template).toBe('number')
    })

    it('should default model to 0', () => {
      const result = zfp(z.object({ field: z.number() }))
      expect(result.model.field).toBe(0)
    })
  })

  describe('ZodBigInt', () => {
    it('should parse as bigint template', () => {
      const schema = z.bigint().meta({ label: '大整数' })
      const result = zfp(z.object({ field: schema }))
      expect(result.node.children!.field.template).toBe('bigint')
    })

    it('should default model to 0n', () => {
      const result = zfp(z.object({ field: z.bigint() }))
      expect(result.model.field).toBe(0n)
    })
  })

  describe('ZodBoolean', () => {
    it('should parse as checkbox template', () => {
      const schema = z.boolean().meta({ label: '启用' })
      const result = zfp(z.object({ field: schema }))
      expect(result.node.children!.field.template).toBe('checkbox')
    })

    it('should default model to false', () => {
      const result = zfp(z.object({ field: z.boolean() }))
      expect(result.model.field).toBe(false)
    })
  })

  describe('ZodDate', () => {
    it('should parse as date template', () => {
      const schema = z.date().meta({ label: '日期' })
      const result = zfp(z.object({ field: schema }))
      expect(result.node.children!.field.template).toBe('date')
    })
  })

  describe('ZodEnum', () => {
    it('should parse as select template', () => {
      const schema = z.enum(['a', 'b', 'c']).meta({ label: '选项' })
      const result = zfp(z.object({ field: schema }))
      expect(result.node.children!.field.template).toBe('select')
    })

    it('should generate options from enum values', () => {
      const schema = z.enum(['red', 'green', 'blue']).meta({ label: '颜色' })
      const result = zfp(z.object({ field: schema }))
      expect(result.node.children!.field.options).toEqual([
        { label: 'red', value: 'red' },
        { label: 'green', value: 'green' },
        { label: 'blue', value: 'blue' },
      ])
    })

    it('should default model to first option', () => {
      const schema = z.enum(['a', 'b', 'c'])
      const result = zfp(z.object({ field: schema }))
      expect(result.model.field).toBe('a')
    })
  })

  describe('ZodLiteral', () => {
    it('should parse as text template', () => {
      const schema = z.literal('fixed').meta({ label: '固定值' })
      const result = zfp(z.object({ field: schema }))
      expect(result.node.children!.field.template).toBe('text')
    })

    it('should be disabled', () => {
      const schema = z.literal('fixed').meta({ label: '固定值' })
      const result = zfp(z.object({ field: schema }))
      expect(result.node.children!.field.disabled).toBe(true)
    })

    it('should set default to literal value', () => {
      const schema = z.literal('fixed').meta({ label: '固定值' })
      const result = zfp(z.object({ field: schema }))
      expect(result.node.children!.field.default).toBe('fixed')
      expect(result.model.field).toBe('fixed')
    })
  })

  describe('ZodLazy', () => {
    it('should parse as json template', () => {
      const schema = z.lazy(() => z.string()).meta({ label: '懒加载' })
      const result = zfp(z.object({ field: schema }))
      expect(result.node.children!.field.template).toBe('json')
    })
  })

  describe('ZodFile', () => {
    it('should parse as file template', () => {
      const schema = z.file().meta({ label: '文件' })
      const result = zfp(z.object({ field: schema }))
      expect(result.node.children!.field.template).toBe('file')
    })

    it('should default model to null', () => {
      const result = zfp(z.object({ field: z.file() }))
      expect(result.model.field).toBe(null)
    })
  })
})