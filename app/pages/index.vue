<template>
  <section class="rounded-box p-4 bg-base-100 flex flex-col gap-4">

    <ATF :schema="toast_options_schema" v-model="toast_options" />
    <button class="btn btn-primary mt-8" @click="show_toast">
      show toast
    </button>

  </section>
</template>

<script setup lang="ts">
const { show } = useToast()

const toast_options = ref<ToastOptions>()
const show_toast = () => {
  if (!toast_options.value) return
  show(toast_options.value)
}
</script>
