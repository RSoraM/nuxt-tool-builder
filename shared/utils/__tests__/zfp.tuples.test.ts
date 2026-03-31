/**
 * zfp - Zod Form Parser
 * Tuple type tests
 */
import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { zfp } from '../zfp'
import { coordinateForm } from '../example'

describe('zfp - tuple schemas', () => {
  describe('coordinateForm', () => {
    const result = zfp(coordinateForm)

    it('should parse root node', () => {
      expect(result.node.template).toBe('object')
    })

    it('should parse name as text', () => {
      expect(result.node.children!.name.template).toBe('text')
      expect(result.node.children!.name.label).toBe('地点名称')
    })

    it('should parse coords as tuple template', () => {
      const coords = result.node.children!.coords
      expect(coords.template).toBe('tuple')
      // Note: label is field name 'coords' because ZodTuple has no meta
      expect(coords.label).toBe('coords')
    })
  })

  describe('tuple children', () => {
    const result = zfp(coordinateForm)
    const coords = result.node.children!.coords

    it('should have numeric string keys', () => {
      expect(coords.children!['0']).toBeDefined()
      expect(coords.children!['1']).toBeDefined()
    })

    it('should parse first item as number (经度)', () => {
      const item0 = coords.children!['0']
      expect(item0.template).toBe('number')
      expect(item0.label).toBe('经度')
      expect(item0.placeholder).toBe('请输入经度')
    })

    it('should parse second item as number (纬度)', () => {
      const item1 = coords.children!['1']
      expect(item1.template).toBe('number')
      expect(item1.label).toBe('纬度')
      expect(item1.placeholder).toBe('请输入纬度')
    })

    it('should have correct paths with brackets', () => {
      expect(coords.children!['0'].path).toBe('[0]')
      expect(coords.children!['1'].path).toBe('[1]')
    })
  })

  describe('tuple model', () => {
    const result = zfp(coordinateForm)

    it('should return array model', () => {
      expect(result.model.coords).toEqual([0, 0])
    })

    it('should have number values in model', () => {
      expect(typeof result.model.coords[0]).toBe('number')
      expect(typeof result.model.coords[1]).toBe('number')
    })
  })

  describe('tuple with different element types', () => {
    it('should handle mixed type tuples', () => {
      const schema = z.object({
        mixed: z.tuple([
          z.string().meta({ label: '字符串' }),
          z.number().meta({ label: '数字' }),
          z.boolean().meta({ label: '布尔' }),
        ]),
      })
      const result = zfp(schema)

      expect(result.node.children!.mixed.children!['0'].template).toBe('text')
      expect(result.node.children!.mixed.children!['1'].template).toBe('number')
      expect(result.node.children!.mixed.children!['2'].template).toBe('checkbox')
    })
  })
})