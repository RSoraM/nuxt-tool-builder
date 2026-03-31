/**
 * zfp - Zod Form Parser
 * Main smoke tests - verify all example schemas can be parsed without errors
 */
import { describe, it, expect } from 'vitest'
import { zfp } from '../zfp'
import {
  userProfile,
  tagsForm,
  shippingAddress,
  paymentForm,
  coordinateForm,
  optionalDemo,
  refinedForm,
  orderForm,
  statusSchema,
  bigintForm,
  fileForm,
  setForm,
  recordForm,
  intersectionForm,
  templateLiteralForm,
  nonOptionalForm,
  genericUnionForm,
  projectConfigForm,
} from '../example'

describe('zfp - smoke tests', () => {
  describe('all example schemas', () => {
    it('should parse userProfile without errors', () => {
      expect(() => zfp(userProfile)).not.toThrow()
    })

    it('should parse tagsForm without errors', () => {
      expect(() => zfp(tagsForm)).not.toThrow()
    })

    it('should parse shippingAddress without errors', () => {
      expect(() => zfp(shippingAddress)).not.toThrow()
    })

    it('should parse paymentForm without errors', () => {
      expect(() => zfp(paymentForm)).not.toThrow()
    })

    it('should parse coordinateForm without errors', () => {
      expect(() => zfp(coordinateForm)).not.toThrow()
    })

    it('should parse optionalDemo without errors', () => {
      expect(() => zfp(optionalDemo)).not.toThrow()
    })

    it('should parse refinedForm without errors', () => {
      expect(() => zfp(refinedForm)).not.toThrow()
    })

    it('should parse orderForm without errors', () => {
      expect(() => zfp(orderForm)).not.toThrow()
    })

    it('should parse statusSchema without errors', () => {
      expect(() => zfp(statusSchema)).not.toThrow()
    })

    it('should parse bigintForm without errors', () => {
      expect(() => zfp(bigintForm)).not.toThrow()
    })

    it('should parse fileForm without errors', () => {
      expect(() => zfp(fileForm)).not.toThrow()
    })

    it('should parse setForm without errors', () => {
      expect(() => zfp(setForm)).not.toThrow()
    })

    it('should parse recordForm without errors', () => {
      expect(() => zfp(recordForm)).not.toThrow()
    })

    it('should parse intersectionForm without errors', () => {
      expect(() => zfp(intersectionForm)).not.toThrow()
    })

    it('should parse templateLiteralForm without errors', () => {
      expect(() => zfp(templateLiteralForm)).not.toThrow()
    })

    it('should parse nonOptionalForm without errors', () => {
      expect(() => zfp(nonOptionalForm)).not.toThrow()
    })

    it('should parse genericUnionForm without errors', () => {
      expect(() => zfp(genericUnionForm)).not.toThrow()
    })

    it('should parse projectConfigForm without errors', () => {
      expect(() => zfp(projectConfigForm)).not.toThrow()
    })
  })

  describe('zfp return structure', () => {
    const result = zfp(shippingAddress)

    it('should return { node, model }', () => {
      expect(result).toHaveProperty('node')
      expect(result).toHaveProperty('model')
    })

    it('should return model as structuredClone', () => {
      const model1 = zfp(shippingAddress).model
      const model2 = zfp(shippingAddress).model
      model1.recipient = 'modified'
      expect(model2.recipient).toBe('')
    })
  })

  describe('basic node structure', () => {
    it('should have root node with template "object"', () => {
      const { node } = zfp(shippingAddress)
      expect(node.template).toBe('object')
    })

    it('should have children on object nodes', () => {
      const { node } = zfp(shippingAddress)
      expect(node.children).toBeDefined()
      expect(Object.keys(node.children!).length).toBeGreaterThan(0)
    })
  })
})