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
    }),

    contacts: z.array(z.object({
      type: z.enum(['email', 'phone']),
      value: z.string().min(3, '联系方式至少3个字符'),
    })).min(1, '至少添加一项联系方式'),
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