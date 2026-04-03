<script setup lang="ts">
const { toasts, remove } = useToast()

const alertClass: Record<string, string> = {
  info: 'alert-info',
  success: 'alert-success',
  warning: 'alert-warning',
  error: 'alert-error',
}

const defaultIcon: Record<string, string> = {
  info: 'icon-[mdi--information-outline]',
  success: 'icon-[mdi--check-circle-outline]',
  warning: 'icon-[mdi--alert-outline]',
  error: 'icon-[mdi--close-circle-outline]',
}
</script>

<template>
  <TransitionGroup name="toast" tag="div" class="toast toast-end toast-top z-50">
    <div v-for="t in toasts" :key="t.id" role="alert" class="alert shadow-lg cursor-pointer" :class="alertClass[t.type]"
      @click="remove(t.id)">
      <span class="size-6 shrink-0" :class="t.icon || defaultIcon[t.type]" />
      <span>{{ t.message }}</span>
    </div>
  </TransitionGroup>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
