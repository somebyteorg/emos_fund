<template>
  <div v-if="user.profile" class="flex min-w-0 items-center gap-2.5">
    <img v-if="user.profile.avatar" :alt="`${user.profile.username} 的头像`" :src="user.profile.avatar" class="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-black/10" />
    <span v-else class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-stone-900 text-xs font-semibold text-white">
      {{ user.initials }}
    </span>
    <span class="max-w-28 truncate text-sm font-medium text-stone-700">{{ user.profile.username }}</span>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted } from 'vue'
  import { useUserStore } from '@/stores/user'

  const user = useUserStore()

  onMounted(() => {
    void user.fetchProfile()
  })
</script>
