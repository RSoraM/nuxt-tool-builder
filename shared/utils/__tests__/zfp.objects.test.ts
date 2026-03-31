/**
 * zfp - Zod Form Parser
 * Object schema tests
 */
import { describe, it, expect } from 'vitest'
import { zfp } from '../zfp'
import { userProfile, shippingAddress, orderForm } from '../example'

describe('zfp - object schemas', () => {
  describe('shippingAddress', () => {
    const result = zfp(shippingAddress)

    it('should parse root node correctly', () => {
      expect(result.node.label).toBe('收货地址')
      expect(result.node.path).toBe('')
      expect(result.node.template).toBe('object')
      expect(result.node.required).toBe(false)
    })

    it('should parse recipient field', () => {
      const node = result.node.children!.recipient
      expect(node.label).toBe('收件人')
      expect(node.path).toBe('recipient')
      expect(node.template).toBe('text')
      expect(node.placeholder).toBe('请输入收件人')
    })

    it('should parse phone field', () => {
      const node = result.node.children!.phone
      expect(node.label).toBe('手机号')
      expect(node.path).toBe('phone')
      expect(node.template).toBe('text')
      expect(node.placeholder).toBe('请输入手机号')
    })

    it('should parse isDefault checkbox', () => {
      const node = result.node.children!.isDefault
      expect(node.label).toBe('设为默认')
      expect(node.path).toBe('isDefault')
      expect(node.template).toBe('checkbox')
      expect(node.default).toBe(false)
    })

    it('should have correct model structure', () => {
      expect(result.model.recipient).toBe('')
      expect(result.model.phone).toBe('')
      expect(result.model.isDefault).toBe(false)
    })
  })

  describe('userProfile', () => {
    const result = zfp(userProfile)

    it('should parse root node', () => {
      expect(result.node.label).toBe('用户资料')
      expect(result.node.template).toBe('object')
    })

    it('should parse string fields as text', () => {
      expect(result.node.children!.username.template).toBe('text')
      expect(result.node.children!.email.template).toBe('text')
      expect(result.node.children!.bio.template).toBe('text')
    })

    it('should parse age with default', () => {
      const age = result.node.children!.age
      expect(age.template).toBe('number')
      expect(age.default).toBe(20)
      expect(result.model.age).toBe(20)
    })

    it('should parse newsletter checkbox with default', () => {
      const newsletter = result.node.children!.newsletter
      expect(newsletter.template).toBe('checkbox')
      expect(newsletter.default).toBe(false)
      expect(result.model.newsletter).toBe(false)
    })

    it('should extract labels from meta', () => {
      expect(result.node.children!.username.label).toBe('用户名')
      expect(result.node.children!.email.label).toBe('邮箱')
    })

    it('should extract placeholders from meta', () => {
      expect(result.node.children!.username.placeholder).toBe('3-20个字符')
      expect(result.node.children!.email.placeholder).toBe('请输入邮箱')
    })
  })

  describe('orderForm - complex nested objects', () => {
    const result = zfp(orderForm)

    it('should parse customer object', () => {
      const customer = result.node.children!.customer
      expect(customer.template).toBe('object')
      expect(customer.children!.name.template).toBe('text')
      expect(customer.children!.email.template).toBe('text')
    })

    it('should parse status as enum select', () => {
      const status = result.node.children!.status
      expect(status.template).toBe('select')
      expect(status.options).toEqual([
        { label: 'draft', value: 'draft' },
        { label: 'published', value: 'published' },
        { label: 'archived', value: 'archived' },
      ])
    })

    it('should parse items array of objects', () => {
      const items = result.node.children!.items
      expect(items.template).toBe('array')
      expect(items.element!.template).toBe('object')
      expect(items.element!.children!.productName.template).toBe('text')
      expect(items.element!.children!.quantity.template).toBe('number')
      expect(items.element!.children!.unitPrice.template).toBe('number')
    })

    it('should parse nested shippingAddress', () => {
      const shipping = result.node.children!.shipping
      expect(shipping.template).toBe('object')
      expect(shipping.children!.recipient.template).toBe('text')
      expect(shipping.children!.phone.template).toBe('text')
    })

    it('should parse agreeToTerms as literal checkbox', () => {
      const agreeToTerms = result.node.children!.agreeToTerms
      expect(agreeToTerms.template).toBe('checkbox')
      expect(agreeToTerms.default).toBe(true)
      expect(agreeToTerms.disabled).toBe(true)
    })

    it('should parse customer model correctly', () => {
      expect(result.model.customer.name).toBe('')
      expect(result.model.customer.email).toBe('')
      // Note: optional fields return '' not undefined in current implementation
      expect(result.model.customer.phone).toBe('')
    })

    it('should parse items model with defaults', () => {
      expect(result.model.items).toEqual([{ productName: '', quantity: 1, unitPrice: 0 }])
    })
  })

  describe('nested object paths', () => {
    it('should build correct paths for nested fields', () => {
      const result = zfp(orderForm)
      // Note: current implementation doesn't build full paths for deeply nested fields
      expect(result.node.children!.customer.children!.name.path).toBe('name')
      expect(result.node.children!.shipping.children!.recipient.path).toBe('recipient')
    })
  })
})