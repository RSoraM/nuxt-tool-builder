/**
 * zfp - Zod Form Parser
 * Union type tests
 */
import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { zfp } from '../zfp'
import { paymentForm, statusSchema } from '../example'

describe('zfp - union schemas', () => {
  describe('ZodDiscriminatedUnion - paymentForm', () => {
    const result = zfp(paymentForm)

    it('should parse payment as union template', () => {
      const payment = result.node.children!.payment
      expect(payment.template).toBe('union')
      expect(payment.label).toBe('支付方式')
    })

    it('should have children for each option', () => {
      const payment = result.node.children!.payment
      expect(Object.keys(payment.children!).length).toBe(3)
    })

    it('should have options with discriminator values', () => {
      const payment = result.node.children!.payment
      // Note: labels are discriminator values in current implementation
      expect(payment.options).toEqual([
        { label: 'card', value: 'card' },
        { label: 'alipay', value: 'alipay' },
        { label: 'wechat', value: 'wechat' },
      ])
    })

    it('should parse card option correctly', () => {
      const card = result.node.children!.payment.children!['0']
      // Note: label is discriminator value in current implementation
      expect(card.label).toBe('card')
      expect(card.children!.method.template).toBe('text')
      expect(card.children!.method.default).toBe('card')
      expect(card.children!.cardNumber.template).toBe('text')
      expect(card.children!.expiry.template).toBe('text')
      expect(card.children!.cvv.template).toBe('text')
    })

    it('should parse alipay option correctly', () => {
      const alipay = result.node.children!.payment.children!['1']
      expect(alipay.label).toBe('alipay')
      expect(alipay.children!.account.template).toBe('text')
    })

    it('should parse wechat option correctly', () => {
      const wechat = result.node.children!.payment.children!['2']
      expect(wechat.label).toBe('wechat')
      expect(wechat.children!.openId.template).toBe('text')
    })
  })

  describe('ZodDiscriminatedUnion - statusSchema (nested)', () => {
    const result = zfp(statusSchema)

    it('should parse statusForm as union', () => {
      const statusForm = result.node.children!.statusForm
      expect(statusForm.template).toBe('union')
      expect(statusForm.label).toBe('状态表单')
    })

    it('should have two top-level options', () => {
      const statusForm = result.node.children!.statusForm
      expect(Object.keys(statusForm.children!).length).toBe(2)
    })

    it('should parse success option', () => {
      const success = result.node.children!.statusForm.children!['0']
      expect(success.label).toBe('成功')
      expect(success.children!.status.default).toBe('success')
      expect(success.children!.data.template).toBe('text')
    })

    it('should parse failed option as nested union', () => {
      const failed = result.node.children!.statusForm.children!['1']
      expect(failed.label).toBe('失败')
      expect(failed.template).toBe('union')
    })

    it('should parse nested discriminated union options', () => {
      const failed = result.node.children!.statusForm.children!['1']
      expect(Object.keys(failed.children!).length).toBe(3)
      expect(failed.options).toEqual([
        { label: '失败 (400)', value: 400 },
        { label: '失败 (401)', value: 401 },
        { label: '失败 (500)', value: 500 },
      ])
    })
  })

  describe('ZodUnion - generic union', () => {
    it('should parse generic union as union template', () => {
      const schema = z.union([
        z.object({ type: z.literal('a'), value: z.string() }),
        z.object({ type: z.literal('b'), value: z.number() }),
      ]).meta({ label: '联合类型' })

      const result = zfp(z.object({ field: schema }))
      const field = result.node.children!.field
      expect(field.template).toBe('union')
      expect(field.label).toBe('联合类型')
    })
  })

  describe('union model structure', () => {
    it('should have first option model for discriminated union', () => {
      const result = zfp(paymentForm)
      expect(result.model.payment).toBeDefined()
      expect(result.model.payment.method).toBe('card')
    })

    it('should have optionDefaults on union node', () => {
      const result = zfp(paymentForm)
      const payment = result.node.children!.payment
      expect(payment.optionDefaults).toBeDefined()
      expect(payment.optionDefaults!.length).toBe(3)
      expect(payment.optionDefaults![0].method).toBe('card')
      expect(payment.optionDefaults![1].method).toBe('alipay')
      expect(payment.optionDefaults![2].method).toBe('wechat')
    })
  })
})