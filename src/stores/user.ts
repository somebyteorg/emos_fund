import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { fundApi } from '@/api/fund'
import type { UserBase } from '@/types/user'

export const useUserStore = defineStore(
  'user',
  () => {
    const profile = ref<UserBase | null>(null)
    const loading = ref(false)
    const loaded = ref(false)

    const initials = computed(() => {
      const username = profile.value?.username?.trim()
      return username ? username.slice(0, 1).toUpperCase() : '?'
    })

    async function fetchProfile(force = false) {
      if (loading.value || (loaded.value && !force)) return profile.value

      loading.value = true
      try {
        profile.value = await fundApi.getUserBase()
        loaded.value = true
        return profile.value
      } finally {
        loading.value = false
      }
    }

    function clear() {
      profile.value = null
      loaded.value = false
    }

    return {
      profile,
      loading,
      loaded,
      initials,
      fetchProfile,
      clear,
    }
  },
  {
    persist: true,
  },
)
