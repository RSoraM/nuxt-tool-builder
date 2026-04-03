<template>
  <ATFFieldset :legend="node.label">
    <template #append>
      <slot name="append" />
    </template>

    <template #delete>
      <slot name="delete" />
    </template>

    <div ref="editorRef"
      class="w-full overflow-hidden rounded-field border border-base-content/20 bg-base-100 text-sm" />
    <p v-if="parseError" class="text-error text-xs mt-1">{{ parseError }}</p>

    <slot />
    <slot name="actions" />
  </ATFFieldset>
</template>

<script setup lang="ts">
import { cloneDeep } from 'lodash-es'

const modelValue = defineModel<any>()
const { node } = defineProps<{ node: ATFNode }>()

// ─── 初始值（同步, SSR 安全）───

const initialValue = modelValue.value !== undefined
  ? cloneDeep(modelValue.value)
  : (node.default !== undefined ? cloneDeep(node.default) : null)

modelValue.value = cloneDeep(initialValue)

// ─── Editor refs ───

const editorRef = ref<HTMLElement>()
const parseError = ref('')

let view: any = null
let internalUpdate = false

// ─── 挂载 CodeMirror（仅客户端）───

onMounted(async () => {
  const { EditorView, basicSetup } = await import('codemirror')
  const { json } = await import('@codemirror/lang-json')

  const doc = JSON.stringify(initialValue, null, 2) ?? 'null'

  const onUpdate = EditorView.updateListener.of((update: any) => {
    if (!update.docChanged) return
    const text = update.state.doc.toString()
    try {
      const parsed = JSON.parse(text)
      parseError.value = ''
      internalUpdate = true
      modelValue.value = parsed
      nextTick(() => { internalUpdate = false })
    }
    catch (e: any) {
      parseError.value = e.message
    }
  })

  view = new EditorView({
    doc,
    extensions: [
      basicSetup,
      json(),
      onUpdate,
      EditorView.theme({
        '&': { maxHeight: '24rem' },
        '.cm-scroller': { overflow: 'auto' },
        '.cm-content, .cm-gutters': { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" },
      }),
    ],
    parent: editorRef.value!,
  })
})

// ─── 响应外部 modelValue 变更 ───

watch(modelValue, (val) => {
  if (internalUpdate || !view) return
  const incoming = JSON.stringify(val, null, 2) ?? 'null'
  const current = view.state.doc.toString()
  if (incoming !== current) {
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: incoming },
    })
  }
}, { deep: true })

// ─── 清理 ───

onUnmounted(() => {
  view?.destroy()
  view = null
})
</script>
