import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useUserStore } from '@/stores/user'

export const useSignStore = defineStore(
  'sign',
  () => {
    const user_token = ref('')

    const isSignedIn = computed(() => Boolean(user_token.value))

    function setToken(token: string) {
      user_token.value = token
    }

    function signOut() {
      user_token.value = ''
      useUserStore().clear()
    }

    return {
      user_token,
      isSignedIn,
      setToken,
      signOut,
    }
  },
  {
    persist: true,
  },
)
