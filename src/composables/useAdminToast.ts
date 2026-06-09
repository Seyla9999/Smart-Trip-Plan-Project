import { reactive, readonly } from 'vue'

export type AdminToastTone = 'success' | 'update' | 'delete'

interface AdminToastState {
  visible: boolean
  message: string
  detail: string
  tone: AdminToastTone
}

const toastState = reactive<AdminToastState>({
  visible: false,
  message: '',
  detail: '',
  tone: 'success',
})

let toastTimer: number | null = null

const defaultDetail = (tone: AdminToastTone) => {
  switch (tone) {
    case 'update':
      return 'Changes have been saved successfully.'
    case 'delete':
      return 'Item removed from the catalog.'
    default:
      return 'Item added successfully.'
  }
}

const clearAdminToast = () => {
  toastState.visible = false
  toastState.message = ''
  toastState.detail = ''
  if (toastTimer) {
    clearTimeout(toastTimer)
    toastTimer = null
  }
}

const showAdminToast = (payload: {
  message: string
  detail?: string
  tone?: AdminToastTone
  duration?: number
}) => {
  const tone = payload.tone ?? 'success'
  toastState.message = payload.message
  toastState.detail = payload.detail ?? defaultDetail(tone)
  toastState.tone = tone
  toastState.visible = true

  if (toastTimer) {
    clearTimeout(toastTimer)
  }
  toastTimer = window.setTimeout(() => {
    toastState.visible = false
  }, payload.duration ?? 4000)
}

export const useAdminToast = () => ({
  toast: readonly(toastState),
  showAdminToast,
  clearAdminToast,
})
