<template>
  <main class="min-h-screen bg-[#f7f4ee] px-6 py-8 text-stone-900">
    <div class="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-between gap-12">
      <header class="flex items-center justify-between">
        <p class="text-xs uppercase tracking-[0.32em] text-stone-500">emos基金会</p>
        <nav class="flex items-center gap-2">
          <UserAccount v-if="sign.isSignedIn" />
          <RouterLink
            v-if="sign.isSignedIn"
            class="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md px-3 text-sm font-medium text-stone-600 transition hover:bg-stone-200/70 hover:text-stone-900"
            to="/order">
            我的订单
          </RouterLink>
          <button
            class="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-stone-900 bg-stone-900 px-3.5 text-sm font-medium leading-none text-white transition hover:border-stone-700 hover:bg-stone-700"
            type="button"
            @click="handleAccountAction">
            {{ sign.isSignedIn ? '退出登录' : '登录' }}
          </button>
        </nav>
      </header>

      <section class="flex flex-1 justify-center pt-20 md:pt-28 lg:pt-32">
        <div class="w-full max-w-3xl">
          <h1 class="text-5xl font-semibold leading-tight tracking-tight text-stone-900 md:text-7xl">
            <span class="block">给你一点理由，</span>
            <span class="block">去做一件想做的事。</span>
          </h1>
          <p class="mt-8 text-base leading-8 text-stone-500">请从活动地址进入</p>
        </div>
      </section>
    </div>
  </main>
</template>

<script lang="ts" setup>
  import { useTitle } from '@vueuse/core'
  import { useSignStore } from '@/stores/sign'
  import { startSignIn } from '@/utils/auth'
  import UserAccount from '@/components/UserAccount.vue'

  useTitle('EMOS 基金会')

  const sign = useSignStore()

  function handleAccountAction() {
    if (sign.isSignedIn) {
      void sign.signOut()
      return
    }

    startSignIn()
  }
</script>
