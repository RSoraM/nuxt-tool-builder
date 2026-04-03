# ATF — Auto Template Form

ATF 是一个基于 Zod 4 schema 自动生成表单的 Vue 组件系统。

核心流程：**Zod Schema → ATFNode Tree → Vue Component Tree → Reactive Data**

## 架构

```
┌───────────────────────────────────────────────────────────┐
│  用户代码                                                  │
│  <ATF :schema="z4.object({...})" v-model="data" />       │
└─────────────────────┬─────────────────────────────────────┘
                      │
┌─────────────────────▼─────────────────────────────────────┐
│  ATF.vue  (入口)                                          │
│  ┌─────────┐  ┌─────────┐  ┌───────────────┐             │
│  │ unwrap  │→ │  parse  │→ │ buildDefaults │             │
│  └─────────┘  └─────────┘  └───────────────┘             │
│  schema → 剥离包装器 → 生成 ATFNode 树 → 初始化默认值       │
│  + 实时校验 (schema.safeParse)                             │
└─────────────────────┬─────────────────────────────────────┘
                      │ ATFNode
┌─────────────────────▼─────────────────────────────────────┐
│  Node.vue  (路由)                                         │
│  根据 node.template 将 ATFNode 路由到对应模板组件           │
└─────────────────────┬─────────────────────────────────────┘
                      │
┌─────────────────────▼─────────────────────────────────────┐
│  模板组件  (渲染)                                          │
│  Text / Number / Toggle / Select / File / Textarea        │
│  Object / Array / Tuple / Record / TemplateLiteral        │
│  Union                                                    │
└─────────────────────┬─────────────────────────────────────┘
                      │
┌─────────────────────▼─────────────────────────────────────┐
│  Fieldset.vue  (布局原语)                                  │
│  为 composite 组件提供 legend / append / delete / actions  │
│  slot 的统一 fieldset 容器                                 │
└───────────────────────────────────────────────────────────┘
```

### 文件职责

| 文件 | 职责 |
|------|------|
| `shared/utils/atf.ts` | 类型定义 (`ATFNode`, `ATFTemplate`)、模板分类常量、`isPrimitiveTemplate` 判断函数、Zod `GlobalMeta` 扩展 |
| `ATF.vue` | 入口组件；`unwrap` + `parse` + `buildDefaults` 解析管线；实时校验；根节点布局决策 |
| `Node.vue` | template → 组件路由映射；透传 slots (`append` / `delete` / `actions` / default) |
| `Fieldset.vue` | 通用 fieldset 布局容器，提供 `legend` / `append` / `delete` / `actions` slots |
| 各模板 `.vue` | 单一 template 类型的渲染逻辑、默认值初始化、v-model 双向绑定 |

## ATFNode 接口

```ts
interface ATFNode {
  schema: z4.ZodType         // 原始 Zod schema（unwrap 后的内层 schema）

  path: string               // 节点路径，如 ".name", ".items[]", ".items[0]"
  label: string              // 显示标签
  template: ATFTemplate      // 模板类型，决定渲染哪个组件

  hidden?: boolean           // 是否隐藏
  disabled?: boolean         // 是否禁用
  placeholder?: string       // 占位文本
  autoComplete?: string      // autocomplete 属性

  // ─── composite 专用字段 ───
  props?: Record<string, ATFNode>            // object: 各属性子节点
  element?: ATFNode                          // array: 元素模板节点
  tuple?: ATFNode[]                          // tuple: 各位置子节点
  template_literal?: ATFNode[]               // template_literal: 各段子节点
  record?: { key: ATFNode, value: ATFNode }  // record: 键/值模板节点
  union?: ATFNode[]                          // union: 各分支子节点
  discriminator?: string                     // union: 判别字段名

  // ─── select/literal 专用 ───
  options?: { label: string; value: any }[]  // 可选项列表

  // ─── 由 unwrap 解析 ───
  required: boolean          // 是否必填
  default?: any              // 默认值
}
```

字段来源：
- `label` / `template` / `placeholder` / `autoComplete` / `disabled` / `hidden`：从 `schema.meta()` 提取，外层包装器优先
- `required` / `default`：由 `unwrap` 过程中的 `ZodOptional` / `ZodDefault` / `ZodNullable` 决定
- `props` / `element` / `tuple` 等 composite 字段：由 `parse` 递归构建

## 模板分类

### Primitive（原型）

渲染为单个输入控件，不含子节点。

| template | Zod 类型 | 组件 | 数据类型 | 默认值 |
|----------|----------|------|----------|--------|
| `text` | `ZodString` / `ZodStringFormat` | `Text.vue` | `string` | `''` |
| `textarea` | `ZodString`（需 meta 指定） | `Textarea.vue` | `string` | `''` |
| `number` | `ZodNumber` | `Number.vue` | `number` | `0` |
| `toggle` | `ZodBoolean` | `Toggle.vue` | `boolean` | `false` |
| `file` | `ZodFile` | `File.vue` | `File \| null` | `null` |
| `select` | `ZodEnum` / `ZodLiteral` | `Select.vue` | `any` | 第一个选项 |

### Composite（嵌合）

包含子节点，使用 `Fieldset.vue` 作为布局容器。

| template | Zod 类型 | 组件 | 数据类型 | 默认值 |
|----------|----------|------|----------|--------|
| `object` | `ZodObject` | `Object.vue` | `Record<string, any>` | 从各属性 default 合成 |
| `array` | `ZodArray` | `Array.vue` | `any[]` | `[]` 或 `[elementDefault]` |
| `tuple` | `ZodTuple` | `Tuple.vue` | `any[]` | 从各位置 default 合成 |
| `record` | `ZodRecord` | `Record.vue` | `Record<string, any>` | `{}` |
| `template_literal` | `ZodTemplateLiteral` | `TemplateLiteral.vue` | `string` | 各段拼接 |
| `union` | `ZodUnion` / `ZodDiscriminatedUnion` | `Union.vue` | 取决于活跃分支 | 第一分支 default |

### Planned

| template | Zod 类型 | 状态 | 说明 |
|----------|----------|------|------|
| `json` | `ZodLazy` | 暂未实现 | 递归/自引用 schema，计划使用 JSON 文本编辑 |

## 解析管线

### 1. unwrap(schema, node?)

递归剥离 Zod 包装器类型，提取 meta 信息和默认值：

```
ZodOptional   → required = false, 继续 unwrap 内层
ZodNonOptional → required = true, 继续 unwrap 内层
ZodDefault    → required = false, 记录 defaultValue, 继续 unwrap 内层
ZodNullable   → required = false, default = null, 继续 unwrap 内层
ZodPipe       → 取 def.in (输入端), 继续 unwrap
```

Meta 合并规则（outside-in）：外层包装器的 meta 优先，内层 meta 仅填充缺失字段。
这确保 `.meta().default()` 和 `.default().meta()` 行为一致。

### 2. parse(schema, path?, label?)

将 unwrap 后的内层 schema 映射到 ATFNode：

1. 调用 `unwrap` 得到内层 schema 和初始 node
2. 按 `instanceof` 判断 Zod 类型，设置 `template` 和构建子节点
3. 调用 `apply_meta` 统一处理 meta 合并和默认 label/template
4. 对 composite 类型递归 `parse` 子 schema

### 3. buildDefaults(node)

从 ATFNode 树构建完整默认值对象：

```
object           → { key: buildDefaults(child), ... }
array            → cloneDeep(node.default) || []
tuple            → [buildDefaults(item0), buildDefaults(item1), ...]
record           → cloneDeep(node.default) || {}
template_literal → 拼接各 part 的 default
union            → buildDefaults(node.union[0])
其他             → cloneDeep(node.default) || undefined
```

## 组件契约

每个模板组件必须遵守以下约定：

### Props & Model

```ts
const data = defineModel<any>()
const { node } = defineProps<{ node: ATFNode }>()
```

### Slots

模板组件必须支持以下 slots（由 Node.vue 透传）：

| slot | 用途 | primitive 用法 | composite 用法 |
|------|------|----------------|----------------|
| `delete` | 删除按钮（数组项中使用） | 使用 `join` 容器包裹输入和删除按钮 | 传递给 Fieldset legend |
| `append` | legend 右侧追加内容 | — | 传递给 Fieldset legend |
| `actions` | 底部操作区 | — | 传递给 Fieldset |
| default | 额外内容 | — | 传递给 Fieldset |

### 默认值初始化

每个组件在 `onMounted` 中检查 `data.value` 是否有效，无效则从 `node.default` 或硬编码回退值初始化。
**必须使用 `cloneDeep` 避免引用共享**。

### Primitive 组件的 delete slot 模式

```vue
<template v-if="$slots.delete">
  <div class="join">
    <input class="... join-item" v-model="data" />
    <slot name="delete" />
  </div>
</template>
<template v-else>
  <input class="..." v-model="data" />
</template>
```

## 组件设计

### Tuple.vue

**Zod 类型**: `ZodTuple` — 固定长度、各位置独立类型的数组。

**行为**:
- 使用 `Fieldset` 包裹，legend 显示 `node.label`
- 遍历 `node.tuple` 用 `ATFNode` 渲染每个位置
- 固定长度，无增删按钮
- 数据格式：`any[]`，每个位置独立双向绑定

**默认值**: `node.tuple.map(child => buildDefaults(child))` 或 `cloneDeep(node.default)`

### Record.vue

**Zod 类型**: `ZodRecord` — 动态键值对，key 通常为 string。

**行为**:
- 使用 `Fieldset` 包裹，legend 右侧 append 区放"添加"按钮
- 内部维护 `entries: Array<{ id: number, key: string, value: any }>` 响应式数组
  - 避免直接操作 object key 导致的 Vue 响应性问题
  - `id` 提供稳定的 v-for key
- 每个 entry 渲染为：
  - key 输入（text input）
  - value 输入（`ATFNode` 使用 `node.record!.value`）
  - delete 按钮
- entries 变更时同步到 v-model `Record<string, any>`
- 数据格式：`Record<string, any>`

**默认值**: `cloneDeep(node.default)` 或 `{}`

### TemplateLiteral.vue

**Zod 类型**: `ZodTemplateLiteral` — 模式化字符串，由固定文本和动态 schema 段交替组成。

**行为**:
- label 显示 `node.label`
- 使用 `join` 容器横向排列所有 part
- literal part（`disabled: true`）：disabled input 显示固定文本
- schema part：可编辑 input
- 内部维护 `parts: string[]` 数组
- 任一 part 变更时，拼接所有 parts 同步到 v-model（string）
- 数据格式：`string`

**默认值**: 拼接各 part 的 default

### Union.vue

**Zod 类型**: `ZodUnion` / `ZodDiscriminatedUnion` — 多分支联合类型。

**行为**:
- 使用 `Fieldset` 包裹
- legend 右侧 append 区放分支选择 `<select>`
- 选项标签优先级：
  1. 分支 node 的 `label`（来自 meta）
  2. discriminator 字段的默认值
  3. 回退为 "选项 N"
- 维护 `drafts: any[]` 缓存每个分支的数据草稿
- 切换分支时：保存当前草稿 → 加载目标分支草稿（首次加载用 `buildDefaults`）
- 渲染活跃分支的 `ATFNode`，使用 `:key="selectedIndex"` 强制重挂载
- 使用显式 `:modelValue` + `@update:modelValue` 避免混合事件绑定问题

**默认值**: `buildDefaults(node.union![0])`

## 设计决策

| 决策 | 原因 |
|------|------|
| parse 逻辑保持在 ATF.vue | 仅被入口组件使用，无需抽取 |
| atf.ts 仅放类型和常量 | 解析逻辑依赖 Zod runtime，不适合放 shared |
| Union 使用 select + drafts 缓存 | 参考历史实现经验，确保分支切换数据不丢失 |
| Union 显式 modelValue 绑定 | 避免混合大小写/kebab 事件在嵌套场景下的绑定问题 |
| Record 内部用 entries 数组 | Object key 重命名时 Vue reactivity 无法追踪，用数组保证稳定渲染 |
| Array 必须 cloneDeep 默认值 | 直接 push `node.element.default` 会导致多项共享引用 |
| TemplateLiteral 的 literal 用 disabled input | 保持视觉一致性，用户可看到完整模式 |
