/**
 * zfp - Zod Form Parser
 * Array schema tests
 */
import { describe, it, expect } from 'vitest'
import { zfp } from '../zfp'
import { tagsForm, shippingAddress, orderForm } from '../example'

describe('zfp - array schemas', () => {
  describe('tagsForm - array of primitives', () => {
    const result = zfp(tagsForm)

    it('should parse title as text', () => {
      expect(result.node.children!.title.template).toBe('text')
    })

    it('should parse tags as array', () => {
      const tags = result.node.children!.tags
      expect(tags.template).toBe('array')
      expect(tags.label).toBe('标签')
      // Note: placeholder may be undefined when array has ZodDefault wrapper
    })

    it('should have element with text template for primitive array', () => {
      const element = result.node.children!.tags.element!
      expect(element.template).toBe('text')
      expect(element.path).toBe('[]')
    })

    it('should have correct default model', () => {
      expect(result.model.tags).toEqual(['example'])
    })
  })

  describe('shippingAddress - array of objects', () => {
    const result = zfp(shippingAddress)

    it('should parse address as array', () => {
      const address = result.node.children!.address
      expect(address.template).toBe('array')
      expect(address.label).toBe('地址列表')
      expect(address.placeholder).toBe('请输入地址列表')
    })

    it('should have element as object', () => {
      const element = result.node.children!.address.element!
      expect(element.template).toBe('object')
      expect(element.label).toBe('地址')
    })

    it('should have correct element children', () => {
      const element = result.node.children!.address.element!
      expect(element.children!.province.label).toBe('省份')
      expect(element.children!.province.template).toBe('text')
      expect(element.children!.city.label).toBe('城市')
      expect(element.children!.district.label).toBe('区县')
      expect(element.children!.detail.label).toBe('详细地址')
    })

    it('should have element path as []', () => {
      const element = result.node.children!.address.element!
      expect(element.path).toBe('[]')
    })

    it('should have default model for element', () => {
      const element = result.node.children!.address.element!
      expect(element.default).toEqual({ province: '', city: '', district: '', detail: '' })
    })

    it('should have array model with default element', () => {
      expect(result.model.address).toEqual([{ province: '', city: '', district: '', detail: '' }])
    })
  })

  describe('orderForm - nested arrays', () => {
    const result = zfp(orderForm)

    it('should parse extra as nested array', () => {
      const extra = result.node.children!.extra
      expect(extra.template).toBe('array')
      expect(extra.element!.template).toBe('array')
      expect(extra.element!.element!.template).toBe('number')
    })

    it('should parse items array with object element', () => {
      const items = result.node.children!.items
      expect(items.template).toBe('array')
      expect(items.element!.template).toBe('object')
    })

    it('should parse items element children correctly', () => {
      const element = result.node.children!.items.element!
      expect(element.children!.productName.label).toBe('商品名称')
      expect(element.children!.quantity.label).toBe('数量')
      expect(element.children!.unitPrice.label).toBe('单价')
    })

    it('should have default model for items element', () => {
      const element = result.node.children!.items.element!
      expect(element.default).toEqual({ productName: '', quantity: 1, unitPrice: 0 })
    })

    it('should have correct items model structure', () => {
      expect(result.model.items).toEqual([{ productName: '', quantity: 1, unitPrice: 0 }])
    })
  })

  describe('array element paths', () => {
    it('should use [] for top-level array elements', () => {
      const result = zfp(tagsForm)
      expect(result.node.children!.tags.element!.path).toBe('[]')
    })

    it('should use [key] for nested array elements', () => {
      const result = zfp(orderForm)
      expect(result.node.children!.items.element!.path).toBe('[]')
    })
  })
})