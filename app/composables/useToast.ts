import { v4 as uuid } from 'uuid'
import z4 from 'zod/v4'

export const toast_options_schema = z4.object({
  message: z4.string().nonempty(),
  type: z4.enum(['info', 'success', 'warning', 'error']).optional(),
  icon: z4.string().optional(),
  duration: z4.number().optional(),
}).meta({ label: 'Toast Options' })

export type ToastOptions = z4.infer<typeof toast_options_schema>

interface ToastItem extends Required<Pick<ToastOptions, 'message' | 'type' | 'duration'>> {
  id: string
  icon?: string
}

const toasts = ref<ToastItem[]>([])

export function useToast() {
  function show(options: ToastOptions) {
    console.log(options)
    const id = uuid()
    const toast: ToastItem = {
      id,
      message: options.message,
      type: options.type ?? 'info',
      icon: options.icon,
      duration: options.duration ?? 3000,
    }
    toasts.value.push(toast)

    if (toast.duration > 0) {
      setTimeout(() => {
        remove(id)
      }, toast.duration)
    }

    return id
  }

  function remove(id: string) {
    const idx = toasts.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      toasts.value.splice(idx, 1)
    }
  }

  return {
    toasts: readonly(toasts),
    show,
    remove,
  }
}
