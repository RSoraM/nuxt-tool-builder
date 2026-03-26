import { z } from 'zod/v4'

export const use_example_module = () => {
  const example_form_schema = z.object({
    username: z.string()
      .min(3, '用户名至少3个字符')
      .meta({
        form: {
          label: '用户名',
          placeholder: '请输入用户名',
        },
      }),

    password: z.string()
      .min(6, '密码至少6位')
      .meta({
        form: {
          type: 'password',
          label: '登录密码',
          placeholder: '请输入密码',
        },
      }),

    extant_list: z.boolean()
      .default(true)
      .array(),

    role: z.enum(['admin', 'operator', 'guest']),

    is_active: z.boolean()
      .default(true),

    is_test: z.boolean()
      .default(true)
      .meta({
        form: {
          hidden: true,
        },
      }),

    age: z.number()
      .int()
      .positive()
      .optional(),

    profile: z.object({
      nickname: z.string().min(2, '昵称至少2个字符'),
      bio: z.string().max(200, '简介不能超过200字符').optional()
        .meta({
          form: {
            type: 'textarea',
            label: '个人简介',
            description: '最多200字符',
            placeholder: '介绍一下你自己',
          },
        }),
    }).superRefine((profile, ctx) => {
      // object 内部字段级错误: 定位到 profile.bio
      if (profile.nickname && !profile.bio) {
        ctx.addIssue({
          code: 'custom',
          path: ['bio'],
          message: '填写昵称后，请补充个人简介',
        })
      }

      // object 级错误: 挂在 profile 自身 (path 为空)
      if (profile.nickname === 'root') {
        ctx.addIssue({
          code: 'custom',
          path: [],
          message: 'profile 分组错误示例: nickname 不能为 root',
        })
      }
    }),

    contacts: z.object({
      type: z.enum(['email', 'phone']),
      value: z.string().min(3, '联系方式至少3个字符'),
    }).array().min(1, '至少添加一项联系方式').superRefine((contacts, ctx) => {
      const seen = new Set<string>()

      for (const [index, item] of contacts.entries()) {
        if (seen.has(item.type)) {
          ctx.addIssue({
            code: 'custom',
            path: [index, 'type'],
            message: '联系方式类型不能重复',
          })
        }
        seen.add(item.type)
      }

      // array 级错误: 挂在 contacts 分组自身 (path 为空)
      if (!contacts.some(item => item.type === 'phone')) {
        ctx.addIssue({
          code: 'custom',
          path: [],
          message: 'contacts 分组错误示例: 至少添加一个 phone 类型',
        })
      }
    }),
  }).superRefine((form, ctx) => {
    // root 级跨字段错误: 无法由单个 fieldset 完整替代
    if (form.role === 'admin' && !form.contacts.some(item => item.type === 'phone')) {
      ctx.addIssue({
        code: 'custom',
        path: ['contacts'],
        message: 'role=admin 时，contacts 中必须包含 phone',
      })
    }

    if (!form.is_active && form.age == null) {
      ctx.addIssue({
        code: 'custom',
        path: [],
        message: '根级错误示例: 停用状态下必须填写 age',
      })
    }
  })

  const example_form_default: z.infer<typeof example_form_schema> = {
    username: '',
    password: '',
    extant_list: [],

    role: 'guest',
    is_active: true,
    is_test: true,

    age: undefined,
    profile: {
      nickname: '',
      bio: '',
    },
    contacts: [
      {
        type: 'email',
        value: '',
      },
    ],
  }

  return {
    example_form: {
      default: example_form_default,
      schema: example_form_schema,
    }
  }

}