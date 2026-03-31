<template>
  <main class="mx-auto max-w-4xl px-4 py-8 space-y-6">
    <section class="card bg-base-100 shadow-lg">
      <div class="card-body space-y-4">
        <h1 class="card-title text-2xl">Zod 动态表单示例</h1>
        <p class="text-sm text-base-content/70">
          该页面由 schema 自动生成字段，支持嵌套对象和数组，提交时执行前端与后端双重校验。
        </p>

        <AutoForm :node="node" v-model="data">
          <button type="button" class="btn btn-primary mt-4" :disabled="!data" @click="handleSubmit()">
            提交示例
          </button>
        </AutoForm>
      </div>
    </section>

    <pre>{{ data }}</pre>
    <pre>{{ node }}</pre>

    <section v-if="Object.keys(serverErrors).length" class="card bg-error/10 border border-error/30">
      <div class="card-body">
        <h2 class="font-semibold">后端字段错误</h2>
        <ul class="list-disc pl-5 text-sm">
          <li v-for="(msg, path) in serverErrors" :key="path">{{ path }}: {{ msg }}</li>
        </ul>
      </div>
    </section>

    <section class="card bg-base-100 shadow">
      <div class="card-body">
        <h2 class="font-semibold">提交结果</h2>
        <p class="text-sm" :class="serverMessage === '提交成功' ? 'text-success' : 'text-error'">{{ serverMessage }}</p>
        <pre v-if="submitResult" class="mockup-code whitespace-pre-wrap text-xs">{{ submitResult }}</pre>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
const serverErrors = ref<Record<string, string>>({})
const serverMessage = ref('')
const submitResult = ref<Record<string, unknown> | null>(null)

const clearServerErrors = () => {
  serverErrors.value = {}
  serverMessage.value = ''
}

const { node, model } = zfp(orderForm)
const data = reactive(model)

const handleSubmit = async () => {
  clearServerErrors()

  console.log(orderForm.parse(data))

  // try {
  //   const response = await $fetch('/api/example', {
  //     method: 'POST',
  //     body: data,
  //   })

  //   submitResult.value = response as Record<string, unknown>
  //   serverMessage.value = '提交成功'
  // } catch (error: any) {
  //   submitResult.value = null
  //   const data = error?.data
  //   if (data?.fieldErrors && typeof data.fieldErrors === 'object') {
  //     serverErrors.value = data.fieldErrors
  //   }
  //   serverMessage.value = data?.message ?? '提交失败'
  // }
}
</script>