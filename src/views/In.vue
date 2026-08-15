<template>
  <main class="min-h-screen bg-[#f7f4ee] px-6 py-8 text-stone-900">
    <div class="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl items-center">
      <section class="w-full border border-stone-200 bg-white px-6 py-8 shadow-sm md:px-8">
        <p class="text-xs uppercase tracking-[0.32em] text-stone-500">emos 基金会</p>
        <h1 class="mt-4 text-3xl font-semibold">正在登录</h1>
        <p v-if="errorMessage" class="mt-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {{ errorMessage }}
        </p>
      </section>
    </div>
  </main>
</template>

<script lang="ts" setup>
  import { onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useTitle } from '@vueuse/core'
  import { useSignStore } from '@/stores/sign'
  import { resolveCallbackRedirect } from '@/utils/auth'

  const route = useRoute()
  const router = useRouter()
  const sign = useSignStore()
  const errorMessage = ref('')

  useTitle('登录 · EMOS 基金会')

  function readToken(value: unknown) {
    if (Array.isArray(value)) {
      return typeof value[0] === 'string' ? value[0] : ''
    }

    return typeof value === 'string' ? value : ''
  }

  onMounted(async () => {
    const token = readToken(route.query.token)

    if (!token) {
      errorMessage.value = '回调里没有拿到 token。'
      return
    }

    sign.setToken(token)
    await router.replace(resolveCallbackRedirect())
  })
</script>
