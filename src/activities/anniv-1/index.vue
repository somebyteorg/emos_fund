<template>
  <main class="min-h-screen overflow-hidden bg-[#11100f] text-[#f6f0e5]">
    <div class="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
      <header :class="{ 'intro-visible': introReady }" class="intro-item flex h-20 items-center justify-between border-b border-white/10">
        <RouterLink class="text-xs tracking-[0.28em] text-[#d5b36a]" to="/">EMOS FUND</RouterLink>
        <div class="flex items-center gap-5 text-sm">
          <RouterLink v-if="sign.isSignedIn" :to="{ name: 'orders' }" class="text-white/60 transition hover:text-white">我的订单</RouterLink>
          <button v-if="sign.isSignedIn" class="text-white/45 transition hover:text-white" @click="sign.signOut">退出</button>
          <button v-else class="border border-[#d5b36a]/60 px-4 py-2 text-[#f6e5bd] transition hover:bg-[#d5b36a] hover:text-[#171514]" @click="signIn">登录</button>
        </div>
      </header>

      <section class="grid min-h-[28rem] items-center gap-14 pb-8 pt-12 lg:grid-cols-[1.15fr_.85fr] lg:pb-10 lg:pt-14">
        <div>
          <p :class="{ 'intro-visible': introReady }" class="intro-item mb-7 text-xs tracking-[0.4em] text-[#d5b36a]" style="--intro-delay: 80ms">
            {{ activity?.name || 'EMOS ANNIVERSARY · 01' }}
          </p>
          <h1 :class="{ 'intro-visible': introReady }" class="intro-item max-w-3xl text-5xl font-semibold leading-[1.1] sm:text-6xl lg:text-7xl" style="--intro-delay: 150ms">
            这一年赚的萝卜，
            <br />
            <span class="text-[#d5b36a]">别只留在账户里。</span>
          </h1>
          <p :class="{ 'intro-visible': introReady }" class="intro-item mt-8 max-w-lg text-lg leading-9 text-white/60" style="--intro-delay: 220ms">用一笔报销额度，留下一段属于你的影票。</p>
        </div>

        <div :class="{ 'intro-visible': introReady }" class="intro-item ticket-stage flex justify-center lg:justify-end" style="--intro-delay: 280ms">
          <div ref="ticketElement" :style="ticketStyle" aria-label="EMOS 周年电影票" class="movie-ticket ticket-shadow w-full max-w-md bg-[#f6f0e5] text-[#171514]">
            <div class="p-7 sm:p-8">
              <div class="flex items-start justify-between text-xs">
                <span>EMOS 基金会</span>
                <span class="text-[#756a56]">2025.08.23</span>
              </div>
              <div class="py-10 sm:py-12">
                <p class="text-xs text-[#9a7d43]">怎么拿到补贴</p>
                <div class="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
                  <span class="text-[#9a7d43]">01</span>
                  <span>用萝卜换报销额度</span>
                  <span class="text-[#9a7d43]">02</span>
                  <span>自己买票并完成观影</span>
                  <span class="text-[#9a7d43]">03</span>
                  <span>凭支付截图和电影票申请报销</span>
                </div>
                <p class="mt-5 text-xs leading-5 text-[#756a56]">补贴金额将于 2026 年 10 月 10 日起以现金转账形式陆续到帐。</p>
              </div>
            </div>
            <div class="border-t border-dashed border-[#171514]/30 px-7 py-5 text-xs sm:px-8">
              <div class="border-b border-[#171514]/10 pb-4">
                <p class="text-[#756a56]">可兑换时间</p>
                <p class="mt-1 font-medium">{{ activityPeriod }}</p>
              </div>
              <div class="mt-4 grid grid-cols-3 gap-4">
                <p>
                  <span class="block text-[#756a56]">总资金</span>
                  <span class="mt-1 block font-medium">¥{{ formatNumber(activityTotal) }}</span>
                </p>
                <p>
                  <span class="block text-[#756a56]">已使用</span>
                  <span class="mt-1 block font-medium">¥{{ formatNumber(activityUsed) }}</span>
                </p>
                <p>
                  <span class="block text-[#756a56]">可兑换</span>
                  <span class="mt-1 block font-medium text-[#8f6921]">¥{{ formatNumber(activityRemaining) }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section ref="tierSectionElement" :class="{ 'tiers-visible': tiersVisible }" class="tier-section pb-10 pt-8 lg:pt-10">
        <div class="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-xs tracking-[0.3em] text-white/35">CHOOSE A TIER</p>
            <h2 class="mt-3 text-3xl">选一个补贴档位</h2>
          </div>
          <p class="text-sm text-white/45">
            可用萝卜
            <span class="ml-2 text-[#d5b36a]">
              {{ balanceText }}
            </span>
          </p>
        </div>

        <p v-if="sign.isSignedIn && checkMessage" class="mb-8 border-l-2 border-[#d5b36a] bg-white/[.035] px-4 py-3 text-sm leading-6 text-white/60" role="status">当前无法参与：{{ checkMessage }}</p>
        <p v-if="privateError" class="mb-8 border-l-2 border-red-400 bg-red-400/10 px-4 py-3 text-sm leading-6 text-red-200" role="alert">{{ privateError }}</p>

        <p v-if="activityLoading" class="py-12 text-white/50">正在打开活动...</p>
        <div v-else-if="activityError" class="py-12 text-red-300">
          <p>{{ activityError }}</p>
          <button class="mt-4 text-sm underline underline-offset-4" type="button" @click="loadActivity">重新加载</button>
        </div>
        <div v-else class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <article
            v-for="(tier, index) in tiers"
            :key="tier.carrot"
            :style="{ '--reveal-delay': `${index * 90}ms` }"
            class="tier-card flex flex-col border border-white/10 bg-white/[.035] p-6 hover:border-[#d5b36a]/55">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h3 class="text-xl">{{ tier.name }}</h3>
                <p class="mt-2 text-sm leading-6 text-white/40">
                  {{ tier.description }}
                </p>
              </div>
              <span class="shrink-0 text-sm text-[#d5b36a]">{{ formatNumber(tier.carrot) }} 萝卜</span>
            </div>

            <div class="py-6">
              <p class="text-xs text-white/35">最高补贴</p>
              <p class="mt-2 text-4xl text-white/90">¥{{ formatNumber(tier.price) }}</p>
            </div>

            <div class="mb-5 mt-auto space-y-2 border-t border-white/10 pt-4 text-xs text-white/40">
              <p>已兑 {{ formatNumber(tier.count_used) }} 份，剩余 {{ formatNumber(remaining(tier)) }} 份</p>
              <p class="text-white/65">有效期：{{ ticketPeriod(tier) }}</p>
            </div>

            <button
              :disabled="disabled(tier)"
              class="w-full border border-[#d5b36a] px-5 py-3 text-sm text-[#f6e5bd] transition hover:bg-[#d5b36a] hover:text-[#171514] disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/25"
              @click="choose(tier)">
              {{ label(tier) }}
            </button>
          </article>
        </div>
      </section>

      <p class="border-t border-white/10 py-8 text-xs leading-6 text-white/35">兑换成功后不支持退款；实际报销金额按电影票实付金额计算，最高不超过所选额度。{{ limitText }}</p>
    </div>

    <Transition name="modal">
      <div v-if="selected" class="modal-backdrop fixed inset-0 z-20 grid place-items-center bg-black/80 p-5" @click.self="selected = null">
        <section class="modal-panel w-full max-w-xl border border-[#d5b36a]/50 bg-[#1b1917] p-7 sm:p-8">
          <p class="text-xs text-[#d5b36a]">确认兑换报销额度</p>
          <h2 class="mt-4 text-2xl">{{ selected.name }}</h2>
          <div class="mt-6 space-y-3 text-sm leading-6 text-white/55">
            <p>将消耗 {{ formatNumber(selected.carrot) }} 萝卜，兑换最高 ¥{{ formatNumber(selected.price) }} 报销额度。</p>
            <p v-if="activity?.user_limit">本活动每人最多参与 {{ formatNumber(activity.user_limit) }} 次。</p>
            <p>请在 {{ formatDateTime(selected.time_expired, '订单通知的时间') }} 前完成观影并提交票根。</p>
            <p class="text-white/35">兑换后不支持退款。</p>
          </div>
          <p v-if="actionError" class="mt-6 border-l-2 border-red-400 bg-red-400/10 px-4 py-3 text-sm text-red-200" role="alert">{{ actionError }}</p>
          <div class="mt-8 flex justify-end gap-5">
            <button class="text-sm text-white/50" @click="selected = null">再想想</button>
            <button :disabled="submitting" class="bg-[#d5b36a] px-5 py-3 text-sm text-[#171514] disabled:opacity-50" @click="redeem">
              {{ submitting ? '兑换中...' : '确认兑换' }}
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </main>
</template>

<script lang="ts" setup>
  import type { CSSProperties } from 'vue'
  import { computed, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useIntersectionObserver, useMouseInElement, usePreferredReducedMotion, useTimeout, useTitle } from '@vueuse/core'
  import { fundApi } from '@/api/fund'
  import type { FundActivity, FundTier } from '@/types/fund'
  import { useSignStore } from '@/stores/sign'
  import { startSignIn } from '@/utils/auth'
  import { getApiErrorMessage } from '@/utils/api-error'
  import { formatDateRange, formatDateTime, formatNumber } from '@/utils/format'

  const ACTIVITY_CODE = 'anniv-1'
  const router = useRouter()
  const sign = useSignStore()

  const activity = ref<FundActivity | null>(null)
  const carrot = ref(0)
  const checkMessage = ref('')
  const selected = ref<FundTier | null>(null)
  const activityLoading = ref(true)
  const privateLoading = ref(false)
  const submitting = ref(false)
  const activityError = ref('')
  const privateError = ref('')
  const actionError = ref('')
  const ticketElement = ref<HTMLElement | null>(null)
  const tierSectionElement = ref<HTMLElement | null>(null)
  const tiersVisible = ref(false)

  let privateRequestId = 0

  const introReady = useTimeout(60)
  const reducedMotion = usePreferredReducedMotion()
  const { elementX, elementY, elementWidth, elementHeight, isOutside } = useMouseInElement(ticketElement)

  const tiers = computed(() => [...(activity.value?.tires ?? [])].sort((left, right) => left.carrot - right.carrot))
  const limitText = computed(() => {
    const limit = activity.value?.user_limit
    return limit ? `本活动每人最多参与 ${formatNumber(limit)} 次。` : ''
  })
  const activityTotal = computed(() => activity.value?.amount_total ?? 0)
  const activityUsed = computed(() => activity.value?.amount_used ?? 0)
  const activityRemaining = computed(() => Math.max(activityTotal.value - activityUsed.value, 0))
  const activityPeriod = computed(() => formatDateRange(activity.value?.time_start, activity.value?.time_end))
  const balanceText = computed(() => {
    if (!sign.isSignedIn) return '登录后查看'
    if (privateLoading.value) return '读取中...'
    return formatNumber(carrot.value)
  })
  const ticketStyle = computed<CSSProperties>(() => {
    if (reducedMotion.value === 'reduce' || isOutside.value || !elementWidth.value || !elementHeight.value) {
      return {
        '--ticket-rx': '0deg',
        '--ticket-ry': '0deg',
        '--ticket-x': '0px',
        '--ticket-y': '0px',
      }
    }

    const horizontal = elementX.value / elementWidth.value - 0.5
    const vertical = elementY.value / elementHeight.value - 0.5
    return {
      '--ticket-rx': `${vertical * -5}deg`,
      '--ticket-ry': `${horizontal * 5}deg`,
      '--ticket-x': `${horizontal * 5}px`,
      '--ticket-y': `${vertical * 5}px`,
    }
  })

  useTitle(computed(() => activity.value?.name || 'EMOS 基金会'))
  useIntersectionObserver(
    tierSectionElement,
    ([entry]) => {
      if (entry?.isIntersecting) tiersVisible.value = true
    },
    { threshold: 0.15 },
  )

  watch(
    () => sign.user_token,
    (token) => void loadPrivate(token),
    { immediate: true },
  )
  void loadActivity()

  async function loadActivity() {
    activityLoading.value = true
    activityError.value = ''

    try {
      activity.value = await fundApi.getActivity(ACTIVITY_CODE)
    } catch {
      activityError.value = '这个活动暂时打不开，请稍后再试。'
    } finally {
      activityLoading.value = false
    }
  }

  async function loadPrivate(token: string) {
    const requestId = ++privateRequestId
    privateError.value = ''

    if (!token) {
      carrot.value = 0
      checkMessage.value = ''
      privateLoading.value = false
      return
    }

    privateLoading.value = true

    try {
      const [balance, eligibility] = await Promise.all([fundApi.getCarrotCurrent(), fundApi.checkOrder(ACTIVITY_CODE)])
      if (requestId !== privateRequestId) return

      carrot.value = balance.carrot
      checkMessage.value = eligibility.message?.trim() || ''
    } catch {
      if (requestId === privateRequestId) {
        carrot.value = 0
        checkMessage.value = ''
        privateError.value = '账户信息暂时无法读取，请稍后重试。'
      }
    } finally {
      if (requestId === privateRequestId) privateLoading.value = false
    }
  }

  function signIn() {
    startSignIn(ACTIVITY_CODE)
  }

  function remaining(tier: FundTier) {
    return Math.max(tier.count_total - tier.count_used, 0)
  }

  function ticketPeriod(tier: FundTier) {
    return formatDateRange(activity.value?.time_start, tier.time_expired, '以订单通知为准')
  }

  function disabled(tier: FundTier) {
    return privateLoading.value || Boolean(privateError.value) || Boolean(checkMessage.value) || remaining(tier) <= 0 || (sign.isSignedIn && tier.carrot > carrot.value)
  }

  function label(tier: FundTier) {
    if (!sign.isSignedIn) return '请登录后进行兑换'
    if (privateLoading.value) return '正在读取账户信息'
    if (privateError.value) return '账户信息不可用'
    if (checkMessage.value) return '不可参与'
    if (remaining(tier) <= 0) return '已兑完'
    if (tier.carrot > carrot.value) return '萝卜不足'
    return '兑换'
  }

  function choose(tier: FundTier) {
    if (!sign.isSignedIn) {
      signIn()
      return
    }

    if (!disabled(tier)) {
      actionError.value = ''
      selected.value = tier
    }
  }

  async function redeem() {
    if (!selected.value || submitting.value) return

    submitting.value = true
    actionError.value = ''

    try {
      await fundApi.createOrder(ACTIVITY_CODE, selected.value.carrot)
      await router.push({ name: 'orders' })
    } catch (error) {
      actionError.value = await getApiErrorMessage(error, '兑换失败，请稍后再试。')
    } finally {
      submitting.value = false
    }
  }
</script>

<style scoped>
  .ticket-shadow {
    box-shadow: 22px 26px 0 rgba(213, 179, 106, 0.1);
  }

  .intro-item {
    opacity: 0;
    transform: translateY(18px);
    transition:
      opacity 700ms ease var(--intro-delay, 0ms),
      transform 700ms cubic-bezier(0.22, 1, 0.36, 1) var(--intro-delay, 0ms);
  }

  .intro-item.intro-visible {
    opacity: 1;
    transform: translateY(0);
  }

  .ticket-stage {
    perspective: 1000px;
  }

  .movie-ticket {
    position: relative;
    border: 1px solid rgba(213, 179, 106, 0.55);
    transform: translate3d(var(--ticket-x, 0), var(--ticket-y, 0), 0) rotateX(var(--ticket-rx, 0)) rotateY(var(--ticket-ry, 0)) rotateZ(1.5deg);
    transform-style: preserve-3d;
    transition: transform 160ms ease-out;
    will-change: transform;
  }

  .movie-ticket::before,
  .movie-ticket::after {
    position: absolute;
    bottom: 8.25rem;
    width: 1.25rem;
    height: 1.25rem;
    content: '';
    background: #11100f;
    border-radius: 9999px;
  }

  .movie-ticket::before {
    left: -0.7rem;
  }

  .movie-ticket::after {
    right: -0.7rem;
  }

  .tier-card {
    opacity: 0;
    transform: translateY(24px);
    transition:
      opacity 600ms ease var(--reveal-delay, 0ms),
      transform 600ms cubic-bezier(0.22, 1, 0.36, 1) var(--reveal-delay, 0ms),
      border-color 200ms ease;
  }

  .tiers-visible .tier-card {
    opacity: 1;
    transform: translateY(0);
  }

  .tiers-visible .tier-card:hover {
    transform: translateY(-2px);
  }

  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 220ms ease;
  }

  .modal-enter-active .modal-panel,
  .modal-leave-active .modal-panel {
    transition:
      opacity 220ms ease,
      transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .modal-enter-from,
  .modal-leave-to,
  .modal-enter-from .modal-panel,
  .modal-leave-to .modal-panel {
    opacity: 0;
  }

  .modal-enter-from .modal-panel,
  .modal-leave-to .modal-panel {
    transform: translateY(16px) scale(0.98);
  }

  @media (prefers-reduced-motion: reduce) {
    .intro-item,
    .tier-card,
    .tiers-visible .tier-card:hover {
      opacity: 1;
      transform: none;
      transition: none;
    }

    .movie-ticket {
      transform: rotate(1.5deg);
      transition: none;
    }

    .modal-enter-active,
    .modal-leave-active,
    .modal-enter-active .modal-panel,
    .modal-leave-active .modal-panel {
      transition-duration: 1ms;
    }
  }
</style>
