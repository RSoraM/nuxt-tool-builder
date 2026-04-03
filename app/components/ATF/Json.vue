<template>
  <ATFFieldset :legend="node.label">
    <template #append>
      <select class="select select-bordered select-xs" v-model="selectedType">
        <option v-for="t in jsonTypes" :key="t.value" :value="t.value">
          {{ t.label }}
        </option>
      </select>
    </template>

    <template #delete>
      <slot name="delete" />
    </template>

    <template v-if="selectedType === 'boolean'">
      <label class="label">值</label>
      <select class="select select-bordered w-full" v-model="booleanValue">
        <option :value="true">true</option>
        <option :value="false">false</option>
      </select>
    </template>

    <template v-else-if="selectedType === 'null'">
      <label class="label">值</label>
      <input class="input input-bordered w-full" value="null" disabled />
    </template>

    <template v-else>
      <label class="label">值</label>
      <template v-if="$slots.delete">
        <div class="join join-vertical">
          <slot name="delete" />
          <textarea class="textarea textarea-bordered w-full join-item font-mono"
            :rows="selectedType === 'object' || selectedType === 'array' ? 6 : 2" v-model="textValue" @blur="onBlur" />
        </div>
      </template>
      <template v-else>
        <textarea class="textarea textarea-bordered w-full font-mono"
          :rows="selectedType === 'object' || selectedType === 'array' ? 6 : 2" v-model="textValue" @blur="onBlur" />
      </template>
    </template>

    <slot />
    <slot name="actions" />
  </ATFFieldset>
</template>

<script setup lang="ts">
import { cloneDeep } from 'lodash-es'

type JsonType = 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array'

const jsonTypes: { label: string; value: JsonType }[] = [
  { label: '字符串', value: 'string' },
  { label: '数字', value: 'number' },
  { label: '布尔', value: 'boolean' },
  { label: 'Null', value: 'null' },
  { label: '对象', value: 'object' },
  { label: '数组', value: 'array' },
]

const modelValue = defineModel<any>()
const { node } = defineProps<{ node: ATFNode }>()
const { show } = useToast()

// ─── 从值推断类型 ───

function inferType(val: any): JsonType {
  if (val === null || val === undefined) return 'null'
  if (Array.isArray(val)) return 'array'
  if (typeof val === 'object') return 'object'
  if (typeof val === 'number') return 'number'
  if (typeof val === 'boolean') return 'boolean'
  return 'string'
}

// ─── 值序列化为文本 ───

function valueToText(val: any, type: JsonType): string {
  switch (type) {
    case 'string': return val ?? ''
    case 'number': return String(val ?? 0)
    case 'boolean': return String(val ?? false)
    case 'null': return 'null'
    case 'object':
    case 'array':
      try { return JSON.stringify(val, null, 2) }
      catch { return type === 'object' ? '{}' : '[]' }
  }
}

// ─── 初始值 ───

const initialValue = modelValue.value !== undefined
  ? cloneDeep(modelValue.value)
  : (node.default !== undefined ? cloneDeep(node.default) : null)

const selectedType = ref<JsonType>(inferType(initialValue))
const textValue = ref(valueToText(initialValue, selectedType.value))
const booleanValue = ref(initialValue === true)

// ─── Draft 系统：为每种类型保存草稿 ───

const drafts: Record<JsonType, any> = {
  string: '',
  number: 0,
  boolean: false,
  null: null,
  object: {},
  array: [],
}

// 用初始值填充对应类型的 draft
drafts[selectedType.value] = cloneDeep(initialValue)

// 同步当前值到 modelValue
function syncModelValue() {
  modelValue.value = cloneDeep(drafts[selectedType.value])
}

// 初次同步
syncModelValue()

// ─── blur 解析 ───

function onBlur() {
  const text = textValue.value
  const type = selectedType.value

  switch (type) {
    case 'string':
      drafts.string = text
      break

    case 'number': {
      const n = Number(text)
      if (text.trim() === '' || Number.isNaN(n)) {
        show({ message: `无法将 "${text}" 解析为数字`, type: 'error' })
        return
      }
      drafts.number = n
      break
    }

    case 'object':
    case 'array': {
      try {
        const parsed = JSON.parse(text)
        if (type === 'object' && (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed))) {
          show({ message: '输入内容不是有效的 JSON 对象', type: 'error' })
          return
        }
        if (type === 'array' && !Array.isArray(parsed)) {
          show({ message: '输入内容不是有效的 JSON 数组', type: 'error' })
          return
        }
        drafts[type] = parsed
      }
      catch {
        show({ message: 'JSON 解析失败，请检查格式', type: 'error' })
        return
      }
      break
    }
  }

  syncModelValue()
}

// ─── boolean 变化 ───

watch(booleanValue, (val) => {
  drafts.boolean = val
  syncModelValue()
})

// ─── 类型切换 ───

watch(selectedType, (newType, oldType) => {
  // 保存旧类型的 draft
  if (oldType === 'boolean') {
    drafts.boolean = booleanValue.value
  } else if (oldType !== 'null') {
    // 先尝试解析当前文本
    const text = textValue.value
    if (oldType === 'string') {
      drafts.string = text
    } else if (oldType === 'number') {
      const n = Number(text)
      if (!Number.isNaN(n) && text.trim() !== '') drafts.number = n
    } else if (oldType === 'object' || oldType === 'array') {
      try { drafts[oldType] = JSON.parse(text) } catch { }
    }
  }

  // 恢复新类型的 draft
  if (newType === 'boolean') {
    booleanValue.value = drafts.boolean
  } else if (newType !== 'null') {
    textValue.value = valueToText(drafts[newType], newType)
  }

  syncModelValue()
})
</script>
