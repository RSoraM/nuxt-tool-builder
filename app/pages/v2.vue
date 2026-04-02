<template>
  <section class="rounded-box p-4 bg-base-100 flex flex-col gap-4">
    <h1 class="text-2xl font-bold">自动表单 ATF</h1>

    <ATF :schema="schema" v-model="data" />
  </section>

  <section class="rounded-box p-4 bg-base-100">
    <pre>{{ data }}</pre>
  </section>
</template>

<script setup lang="ts">
import z4 from 'zod/v4';

const schema = z4.object({
  name: z4.string().min(2, '至少 2 个字符'),
  age: z4.number().int().positive('必须是正整数'),
  email: z4.email('无效的邮箱地址'),
  password: z4.string().min(6, '至少 6 个字符'),
  bi: z4.bigint().positive('必须是正整数'),
})
const data = ref<any>(undefined)
</script>