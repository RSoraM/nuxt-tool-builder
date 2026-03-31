import { z } from "zod/v4";

// ============================================================
// 示例 1: 嵌套对象 — 用户资料
// ============================================================
export const userProfile = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .meta({ label: "用户名", placeholder: "3-20个字符" }),
  email: z.email()
    .meta({ label: "邮箱", placeholder: "请输入邮箱" }),
  age: z.number().min(0).max(150).default(20).optional()
    .meta({ label: "年龄", placeholder: "请输入年龄" }),
  bio: z.string().max(500).optional()
    .meta({ label: "个人简介", placeholder: "介绍一下你自己" }),
  newsletter: z.boolean().default(false)
    .meta({ label: "订阅通讯", placeholder: "是否订阅通讯" }),
}).meta({ label: "用户资料" });

// ============================================================
// 示例 2: 数组 — 标签列表
// ============================================================
export const tagsForm = z.object({
  title: z.string()
    .meta({ label: "标题", placeholder: "请输入标题" }),
  tags: z.array(z.string().min(1).default('test'))
    .min(1)
    .max(10)
    .default(['example'])
    .meta({ label: "标签", placeholder: "请输入标签" }),
});

// ============================================================
// 示例 3: 深度嵌套 — 收货地址
// ============================================================
export const shippingAddress = z.object({
  recipient: z.string()
    .meta({ label: "收件人", placeholder: "请输入收件人" }),
  phone: z.string().regex(/^1[3-9]\d{9}$/)
    .meta({ label: "手机号", placeholder: "请输入手机号" }),
  address: z.array(
    z.object({
      province: z.string()
        .meta({ label: "省份", placeholder: "请输入省份" }),
      city: z.string()
        .meta({ label: "城市", placeholder: "请输入城市" }),
      district: z.string()
        .meta({ label: "区县", placeholder: "请输入区县" }),
      detail: z.string()
        .meta({ label: "详细地址", placeholder: "请输入详细地址" }),
    }).meta({ label: '地址' })
  ).meta({ label: "地址列表", placeholder: "请输入地址列表" }),
  isDefault: z.boolean().default(false)
    .meta({ label: "设为默认", placeholder: "是否设为默认" }),
});

// ============================================================
// 示例 4: 判别联合 — 支付方式
// ============================================================
export const paymentForm = z.object({
  payment: z.discriminatedUnion("method", [
    z.object({
      method: z.literal("card")
        .meta({ label: "银行卡" }),
      cardNumber: z.string().regex(/^\d{16}$/)
        .meta({ label: "卡号", placeholder: "请输入卡号" }),
      expiry: z.string()
        .meta({ label: "有效期", placeholder: "请输入有效期" }),
      cvv: z.string()
        .meta({ label: "CVV", placeholder: "请输入CVV" }),
    }),
    z.object({
      method: z.literal("alipay")
        .meta({ label: "支付宝" }),
      account: z.string()
        .meta({ label: "支付宝账号", placeholder: "请输入支付宝账号" }),
    }),
    z.object({
      method: z.literal("wechat")
        .meta({ label: "微信支付" }),
      openId: z.string()
        .meta({ label: "微信 OpenID", placeholder: "请输入微信 OpenID" }),
    }),
  ]).meta({ label: "支付方式" })
})

// ============================================================
// 示例 5: 元组 — 坐标
// ============================================================
export const coordinateForm = z.object({
  name: z.string()
    .meta({ label: "地点名称", placeholder: "请输入地点名称" }),
  coords: z.tuple([
    z.number().meta({ label: "经度", placeholder: "请输入经度" }),
    z.number().meta({ label: "纬度", placeholder: "请输入纬度" })
  ]),
});

// ============================================================
// 示例 6: 可选 & nullable
// ============================================================
export const optionalDemo = z.object({
  required: z.string()
    .meta({ label: "必填字段", placeholder: "请输入必填字段" }),
  optional: z.string().optional()
    .meta({ label: "可选字段", placeholder: "请输入可选字段" }),
  nullable: z.string().nullable()
    .meta({ label: "可空字段", placeholder: "请输入可空字段" }),
  optionalNullable: z
    .string()
    .optional()
    .nullable()
    .meta({ label: "可选且可空", placeholder: "请输入可选且可空字段" }),
});

// ============================================================
// 示例 7: 带 refine 的自定义验证
// ============================================================
export const refinedForm = z
  .object({
    password: z.string().min(8).meta({ label: "密码", placeholder: "请输入密码|至少8位", template: 'password' }),
    confirmPassword: z.string().meta({ label: "确认密码", placeholder: "请输入确认密码", template: 'password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次密码不一致",
    path: ["confirmPassword"],
  });

// ============================================================
// 示例 8: 复杂表单 — 完整订单
// ============================================================
export const orderForm = z.object({
  customer: z.object({
    name: z.string()
      .meta({ label: "客户姓名", placeholder: "请输入客户姓名" }),
    email: z.email()
      .meta({ label: "邮箱", placeholder: "请输入邮箱" }),
    phone: z.string().optional()
      .meta({ label: "电话", placeholder: "请输入电话" }),
  }),
  status: z.enum(["draft", "published", "archived"])
    .meta({ label: "状态", placeholder: "请选择状态" }),
  extra: z.number().array().array()
    .meta({ label: "额外数据", placeholder: "请输入额外数据" }),
  items: z.object({
    productName: z.string()
      .meta({ label: "商品名称", placeholder: "请输入商品名称" }),
    quantity: z.number().min(1).default(1)
      .meta({ label: "数量", placeholder: "请输入数量" }),
    unitPrice: z.number().min(0)
      .meta({ label: "单价", placeholder: "请输入单价" }),
  }).meta({ label: "商品" })
    .array()
    .min(1)
    .meta({ label: "商品列表", placeholder: "请输入商品列表" }),
  shipping: shippingAddress,
  payment: paymentForm.shape.payment,
  notes: z.string().max(1000).optional()
    .meta({ label: "备注", placeholder: "请输入备注" }),
  agreeToTerms: z.literal(true)
    .meta({ label: "同意条款", placeholder: "请同意条款", template: 'checkbox' }),
});

// ============================================================
// 示例 9: 嵌套 discriminatedUnion
// ============================================================
export const statusSchema = z.object({
  statusForm: z.discriminatedUnion("status", [
    z.object({
      status: z.literal("success").meta({ label: "状态" }),
      data: z.string().meta({ label: "数据", placeholder: "请输入数据" }),
    }).meta({ label: "成功" }),
    z.discriminatedUnion("code", [
      z.object({
        status: z.literal("failed").meta({ label: "状态" }),
        message: z.string().meta({ label: "消息", placeholder: "请输入消息" }),
        code: z.literal(400).meta({ label: "错误码" }),
      }).meta({ label: "失败 (400)" }),
      z.object({
        status: z.literal("failed").meta({ label: "状态" }),
        message: z.string().meta({ label: "消息", placeholder: "请输入消息" }),
        code: z.literal(401).meta({ label: "错误码" }),
      }).meta({ label: "失败 (401)" }),
      z.object({
        status: z.literal("failed").meta({ label: "状态" }),
        message: z.string().meta({ label: "消息", placeholder: "请输入消息" }),
        code: z.literal(500).meta({ label: "错误码" }),
      }).meta({ label: "失败 (500)" }),
    ]).meta({ label: "失败" }),
  ]).meta({ label: "状态表单" })
});