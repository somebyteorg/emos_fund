import { useLocalStorage } from '@vueuse/core'
import { PREFIX_URL } from '@/utils/ky'

const PENDING_ACTIVITY_KEY = 'emos_fund_pending_activity_code'
const SIGN_IN_URL = `${PREFIX_URL}api/sign?state=emos_fund`

const pendingActivityCode = useLocalStorage<string | null>(PENDING_ACTIVITY_KEY, null)

function normalizeActivityCode(code?: string | null) {
  return code?.trim() || null
}

export function resolveCallbackRedirect() {
  const activityCode = normalizeActivityCode(pendingActivityCode.value)
  pendingActivityCode.value = null
  return activityCode ? `/${activityCode}` : '/'
}

export function startSignIn(activityCode?: string) {
  pendingActivityCode.value = normalizeActivityCode(activityCode)
  window.location.assign(SIGN_IN_URL)
}
