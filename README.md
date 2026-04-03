# Nuxt Tool Builder

一个基于 Nuxt 4 + Zod 4 的自适应模板表单生成器。

## 使用模板

```bash
pnpm create nuxt@latest -t gh:RSoraM/nuxt-tool-builder <project-name>
```

## 核心概念

### ATF (Adaptive Template Form)

ATF 是一个通过 Zod Schema 驱动的表单生成系统。只需定义 Schema，即可自动生成对应的表单界面。

```ts
import z4 from 'zod/v4'

const schema = z4.object({
  name: z4.string().default('张三').meta({ label: '姓名' }),
  age: z4.number().default(18).meta({ label: '年龄' }),
  role: z4.enum(['admin', 'user']).default('user').meta({ label: '角色' }),
}).meta({ label: '用户信息' })
```

```vue
<template>
  <ATF :schema="schema" v-model="formData" />
</template>
```

### Schema 元信息

通过 `.meta()` 为字段附加 UI 配置：

| 属性 | 类型 | 说明 |
|------|------|------|
| `label` | `string` | 字段显示名称 |
| `template` | `ATFTemplate` | 渲染模板类型 |
| `placeholder` | `string` | 占位文本 |
| `disabled` | `boolean` | 是否禁用 |
| `hidden` | `boolean` | 是否隐藏 |

支持的模板类型：

**基础类型**
- `text` - 单行文本输入
- `textarea` - 多行文本输入
- `number` - 数字输入
- `toggle` - 开关
- `select` - 下拉选择
- `file` - 文件上传

**复合类型**
- `object` - 对象表单
- `array` - 数组列表
- `tuple` - 定长元组
- `record` - 键值对字典
- `union` - 联合类型表单
- `template_literal` - 模板字符串

### Zod 类型支持

| Zod 类型 | ATF 模板 | 说明 |
|----------|----------|------|
| `ZodString` | `text` | 字符串 |
| `ZodString` + `.meta({ template: 'textarea' })` | `textarea` | 长文本 |
| `ZodNumber` | `number` | 数字 |
| `ZodBoolean` | `toggle` | 开关 |
| `ZodEnum` | `select` | 枚举选择 |
| `ZodLiteral` | `select` | 字面量选择 |
| `ZodFile` | `file` | 文件 |
| `ZodObject` | `object` | 嵌套对象 |
| `ZodArray` | `array` | 数组列表 |
| `ZodTuple` | `tuple` | 定长元组 |
| `ZodRecord` | `record` | 键值字典 |
| `ZodUnion` | `union` | 联合类型 |
| `ZodDiscriminatedUnion` | `union` | 有判别联合 |
| `ZodTemplateLiteral` | `template_literal` | 模板字符串 |
| `ZodLazy` | `json` | JSON 编辑器 |

支持嵌套组合，例如嵌套对象、嵌套联合、有判别联合等复杂结构。

### 表单验证

ATF 内置实时验证。Zod Schema 的校验规则会自动应用于表单数据：

```ts
const schema = z4.object({
  email: z4.string().email().meta({ label: '邮箱' }),
  age: z4.number().min(0).max(150).meta({ label: '年龄' }),
})
```

验证错误会显示在表单下方。

## 技术栈

- **框架**: Nuxt 4
- **UI**: Tailwind CSS + daisyUI
- **图标**: Iconify
- **验证**: Zod 4
- **状态**: Vue 3 Composition API
- **存储**: unstorage

## 开发

```bash
pnpm install
pnpm dev
```