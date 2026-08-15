<template>
  <main class="min-h-screen bg-[#f7f4ee] text-stone-900">
    <div class="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8 sm:px-8 lg:py-10">
      <header class="flex items-center justify-between border-b border-stone-200 pb-6">
        <RouterLink class="text-xl font-semibold text-stone-900 transition hover:text-stone-500" to="/">我的订单</RouterLink>
        <button
          class="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-stone-900 bg-stone-900 px-3.5 text-sm font-medium leading-none text-white transition hover:border-stone-700 hover:bg-stone-700"
          type="button"
          @click="signOut">
          退出登录
        </button>
      </header>

      <div class="flex min-w-0 flex-1 flex-col">
        <section v-if="!sign.isSignedIn" class="mt-8 border border-stone-200 bg-white p-8 sm:p-12">
          <p class="text-xs font-medium tracking-[0.24em] text-stone-500">WELCOME BACK</p>
          <h2 class="mt-4 text-2xl font-semibold">登录后提交你的凭证</h2>
          <p class="mt-3 max-w-xl text-sm leading-7 text-stone-600">登录后即可查看兑换订单、上传票根。提交后由后台审核，审核通过后安排打款。</p>
          <button class="mt-7 bg-stone-900 px-5 py-3 text-sm text-white transition hover:bg-stone-700" type="button" @click="signIn">去登录</button>
        </section>

        <template v-else>
          <div v-if="currentOrder" :aria-busy="orderLoading" class="relative mt-8">
            <div v-if="orderLoading" class="absolute inset-0 z-10 flex items-center justify-center bg-white/90" role="status">
              <div class="flex items-center gap-3 text-sm font-medium text-stone-700">
                <span class="h-5 w-5 animate-spin rounded-full border-2 border-stone-300 border-t-stone-800"></span>
                正在加载订单...
              </div>
            </div>
            <p v-if="orderError" class="mb-6 border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{{ orderError }}</p>
            <section class="border border-stone-200 bg-white p-7 sm:p-9">
              <div class="border-b border-stone-200 pb-7">
                <RouterLink :to="`/${currentOrder.activity_code}`" class="text-2xl font-semibold leading-tight hover:underline">{{ currentOrder.activity_name }}</RouterLink>
                <p class="mt-2 text-sm text-stone-500">{{ currentOrder.order_title }}</p>
              </div>
              <dl class="mt-7 space-y-5 text-sm">
                <div class="flex justify-between gap-4">
                  <dt class="text-stone-500">订单号</dt>
                  <dd class="font-mono text-xs text-stone-600">{{ currentOrder.order_no }}</dd>
                </div>
                <div class="flex justify-between gap-4">
                  <dt class="text-stone-500">兑换时间</dt>
                  <dd>{{ formatDateTime(currentOrder.payed_at) }}</dd>
                </div>
                <div class="flex justify-between gap-4">
                  <dt class="text-stone-500">档位名称</dt>
                  <dd>{{ currentOrder.tier_name }}</dd>
                </div>
                <div class="flex justify-between gap-4">
                  <dt class="text-stone-500">档位简介</dt>
                  <dd class="max-w-[60%] text-right text-stone-600">{{ currentOrder.tier_description }}</dd>
                </div>
                <div class="flex justify-between gap-4">
                  <dt class="text-stone-500">档位金额</dt>
                  <dd>¥ {{ formatNumber(currentOrder.tier_price) }}</dd>
                </div>
                <div class="flex justify-between gap-4">
                  <dt class="text-stone-500">档位萝卜</dt>
                  <dd>{{ currentOrder.tier_carrot }} 🥕</dd>
                </div>
              </dl>
            </section>

            <section class="mt-6 border border-stone-200 bg-white p-7 sm:p-9">
              <div class="flex items-start justify-between gap-5">
                <div>
                  <p class="text-xs tracking-[0.2em] text-stone-500">凭证上传</p>
                  <p class="mt-2 text-sm text-stone-500">最后上传期限：{{ formatDateTime(currentOrder.time_expired) }}</p>
                </div>
                <div class="flex shrink-0 items-center gap-2">
                  <span class="text-xs text-stone-500">审核状态</span>
                  <span :class="statusClass" class="inline-flex px-3 py-1.5 text-xs">{{ currentOrder.payout_status_string }}</span>
                </div>
              </div>
              <p class="mt-6 border-l-2 border-amber-400 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">凭证上传功能将于 26 年 9 月 1 日后开放。</p>
            </section>
          </div>
          <section v-else-if="orderLoading" class="mt-8 flex min-h-64 items-center justify-center border border-stone-200 bg-white" role="status">
            <div class="flex items-center gap-3 text-sm font-medium text-stone-700">
              <span class="h-5 w-5 animate-spin rounded-full border-2 border-stone-300 border-t-stone-800"></span>
              正在加载订单...
            </div>
          </section>
          <section v-else-if="orderError" class="mt-8 border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700">
            <p>{{ orderError }}</p>
            <button class="mt-4 font-medium underline underline-offset-4" type="button" @click="retryOrders">重新加载</button>
          </section>
          <section v-else class="mt-8 border border-stone-200 bg-white p-8 text-sm leading-7 text-stone-600">这里空空的 可前往活动页兑换</section>

          <footer v-if="totalPages > 1" class="mt-auto flex items-center justify-center gap-5 border-t border-stone-200 pt-7">
            <button
              :disabled="orderLoading || page <= 1"
              class="border border-stone-300 px-3 py-2 text-sm text-stone-700 transition hover:border-stone-600 disabled:cursor-not-allowed disabled:opacity-35"
              type="button"
              @click="changePage(page - 1)">
              ← 上一个
            </button>
            <span class="text-xs text-stone-500">第 {{ page }} / {{ totalPages }} 页</span>
            <button
              :disabled="orderLoading || page >= totalPages"
              class="border border-stone-300 px-3 py-2 text-sm text-stone-700 transition hover:border-stone-600 disabled:cursor-not-allowed disabled:opacity-35"
              type="button"
              @click="changePage(page + 1)">
              下一个 →
            </button>
          </footer>
        </template>
      </div>
    </div>
  </main>
</template>

<script lang="ts" setup>
  import { computed, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useTitle } from '@vueuse/core'
  import { useSignStore } from '@/stores/sign'
  import { fundApi } from '@/api/fund'
  import type { FundOrderItem, FundOrderListResponse } from '@/types/fund'
  import { formatDateTime, formatNumber } from '@/utils/format'
  import { startSignIn } from '@/utils/auth'

  const PAGE_SIZE = 1
  const SUCCESS_STATUSES = new Set(['success', 'paid', 'done'])
  const FAILED_STATUSES = new Set(['reject', 'failed'])

  const route = useRoute()
  const router = useRouter()
  const sign = useSignStore()

  const currentOrder = ref<FundOrderItem | null>(null)
  const orderLoading = ref(false)
  const orderError = ref('')
  const page = ref(1)
  const total = ref(0)

  let latestRequestId = 0
  let skipRouteOrderNo: string | null = null

  const orderNo = computed(() => String(route.params.orderNo ?? '').trim())
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))
  useTitle('我的订单')

  watch(
    [() => sign.user_token, orderNo],
    ([token, nextOrderNo], [previousToken] = ['', '']) => {
      if (!token) {
        resetOrders()
        return
      }

      if (token === previousToken && skipRouteOrderNo === nextOrderNo) {
        skipRouteOrderNo = null
        return
      }

      skipRouteOrderNo = null
      page.value = 1
      void fetchOrders(1, nextOrderNo || undefined)
    },
    { immediate: true },
  )

  function applyOrderList(list: FundOrderListResponse, targetPage: number) {
    page.value = targetPage
    total.value = list.total
    currentOrder.value = list.items[0] ?? null
  }

  function resetOrders() {
    latestRequestId += 1
    currentOrder.value = null
    orderLoading.value = false
    orderError.value = ''
    page.value = 1
    total.value = 0
  }

  async function fetchOrders(targetPage: number, filterOrderNo?: string) {
    const requestId = ++latestRequestId
    orderLoading.value = true
    orderError.value = ''

    try {
      const list = await fundApi.getOrderList({
        page: targetPage,
        pageSize: PAGE_SIZE,
        orderNo: filterOrderNo,
      })
      if (requestId !== latestRequestId) return null

      applyOrderList(list, targetPage)
      return list
    } catch {
      if (requestId === latestRequestId) orderError.value = '订单暂时无法加载，请稍后重试。'
      return null
    } finally {
      if (requestId === latestRequestId) orderLoading.value = false
    }
  }

  async function changePage(next: number) {
    if (next < 1 || next > totalPages.value || orderLoading.value) return

    const list = await fetchOrders(next)
    const nextOrder = list?.items[0]
    if (!nextOrder) return

    skipRouteOrderNo = nextOrder.order_no
    try {
      await router.push({ name: 'orders', params: { orderNo: nextOrder.order_no } })
    } finally {
      skipRouteOrderNo = null
    }
  }

  function retryOrders() {
    void fetchOrders(page.value, orderNo.value || undefined)
  }

  function signIn() {
    startSignIn()
  }

  function signOut() {
    void sign.signOut()
  }

  function statusTone(status: string) {
    if (SUCCESS_STATUSES.has(status)) return 'bg-emerald-50 text-emerald-700'
    if (FAILED_STATUSES.has(status)) return 'bg-rose-50 text-rose-700'
    return 'bg-amber-50 text-amber-700'
  }

  const statusClass = computed(() => statusTone(currentOrder.value?.payout_status || 'default'))
</script>
