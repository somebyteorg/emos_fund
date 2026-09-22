<template>
  <section class="mt-6 border border-stone-200 bg-white p-6 sm:p-9">
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <p class="text-xs tracking-[0.2em] text-stone-500">凭证上传</p>
        <p v-if="canUpload" class="mt-2 text-sm text-stone-500">最后上传期限：{{ formatDateTime(order.time_expired) }}</p>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <span class="text-xs text-stone-500">审核状态</span>
        <span :class="statusClass" class="inline-flex px-3 py-1.5 text-xs">{{ statusLabel }}</span>
      </div>
    </div>

    <div v-if="hasSavedEvidence" class="mt-8 border-t border-stone-200 pt-7">
      <div class="flex items-center justify-between gap-4">
        <p class="text-xs tracking-[0.2em] text-stone-500">已上传凭证</p>
        <p v-if="order.order_body_upload_at" class="shrink-0 text-xs text-stone-400">上传时间 {{ formatDateTime(order.order_body_upload_at) }}</p>
      </div>
      <div v-if="savedImages.length" class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div v-for="image in savedImages" :key="image" class="aspect-square overflow-hidden border border-stone-200 bg-stone-100">
          <img :src="image" alt="已上传的报销凭证" class="h-full w-full object-cover" loading="lazy" />
        </div>
      </div>
      <div v-if="savedRemark" class="mt-5 border-l-2 border-stone-300 bg-stone-50 px-4 py-3">
        <p class="text-xs text-stone-500">备注</p>
        <p class="mt-1 whitespace-pre-wrap text-sm leading-6 text-stone-700">{{ savedRemark }}</p>
      </div>
    </div>

    <div v-if="canUpload && !submitted" class="mt-8">
      <div class="border border-dashed border-stone-300 bg-stone-50/70 px-5 py-6 text-center transition hover:border-stone-500 hover:bg-stone-50">
        <input :id="inputId" accept="image/*" class="sr-only" multiple type="file" @change="handleFileSelection" />
        <label :for="inputId" class="block cursor-pointer">
          <span class="mx-auto grid h-11 w-11 place-items-center rounded-full bg-stone-900 text-xl text-white">+</span>
          <span class="mt-3 block text-sm font-medium text-stone-800">请上传相关图片报销凭证</span>
        </label>
      </div>

      <div v-if="uploadItems.length" class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div v-for="item in uploadItems" :key="item.id" class="group relative aspect-square overflow-hidden border border-stone-200 bg-stone-100">
          <img :alt="item.file.name" :src="item.previewUrl" class="h-full w-full object-cover" />
          <div class="absolute inset-x-0 bottom-0 bg-stone-950/80 px-2 py-2 text-[11px] text-white">
            <div class="flex items-center justify-between gap-2">
              <span class="min-w-0 truncate">{{ statusText(item) }}</span>
              <span v-if="item.status === 'uploading'" class="h-3 w-3 shrink-0 animate-spin rounded-full border border-white/40 border-t-white"></span>
              <button
                v-if="item.status === 'error'"
                :disabled="saving"
                class="shrink-0 underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                @click.stop="retryUpload(item.id)">
                重新上传
              </button>
            </div>
            <div v-if="item.status === 'uploading'" class="mt-1 h-1 bg-white/20">
              <div :style="{ width: `${item.progress}%` }" class="h-full bg-white transition-[width]"></div>
            </div>
          </div>
          <button
            :aria-label="`移除 ${item.file.name}`"
            :disabled="busy || saving"
            class="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/65 text-lg leading-none text-white opacity-0 transition hover:bg-black/85 group-hover:opacity-100 disabled:cursor-not-allowed"
            title="移除图片"
            type="button"
            @click="removeUpload(item.id)">
            ×
          </button>
        </div>
      </div>

      <div class="mt-6">
        <label class="text-sm font-medium text-stone-800" for="evidence-remark">备注</label>
        <textarea
          id="evidence-remark"
          v-model="remark"
          class="mt-2 min-h-28 w-full resize-y border border-stone-300 bg-white px-3.5 py-3 text-sm leading-6 outline-none transition placeholder:text-stone-400 focus:border-stone-700"
          maxlength="200"
          placeholder="补充说明（选填）"></textarea>
        <div class="mt-1 flex justify-end text-xs text-stone-400">{{ remark.length }} / 200</div>
      </div>

      <p v-if="errorMessage" class="mt-4 border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700" role="alert">
        {{ errorMessage }}
      </p>
      <button
        :disabled="!canSave"
        class="mt-5 inline-flex min-h-11 w-full items-center justify-center bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
        type="button"
        @click="save">
        {{ saveLabel }}
      </button>
    </div>

    <div v-else-if="submitted" class="mt-8 border border-emerald-200 bg-emerald-50 px-5 py-6">
      <p class="text-lg font-semibold text-emerald-900">已提交报销凭证</p>
      <p class="mt-2 text-sm leading-6 text-emerald-800">正在审核中</p>
    </div>
  </section>
</template>

<script lang="ts" setup>
  import { computed, onBeforeUnmount, ref } from 'vue'
  import { Upload } from 'tus-js-client'
  import { fundApi } from '@/api/fund'
  import type { FundOrderItem } from '@/types/fund'
  import { getApiErrorMessage } from '@/utils/api-error'
  import { formatDateTime } from '@/utils/format'
  import { useUserStore } from '@/stores/user'

  const MAX_IMAGES = 9
  const MAX_REMARK_LENGTH = 200
  const SUCCESS_STATUSES = new Set(['success', 'paid', 'done'])
  const FAILED_STATUSES = new Set(['reject', 'failed'])

  type UploadStatus = 'pending' | 'uploading' | 'success' | 'error'

  interface UploadItem {
    id: number
    file: File
    previewUrl: string
    status: UploadStatus
    progress: number
    url: string
    errorMessage: string
  }

  const props = defineProps<{
    order: FundOrderItem
  }>()

  const user = useUserStore()
  const inputId = 'evidence-images'
  const uploadItems = ref<UploadItem[]>([])
  const remark = ref('')
  const errorMessage = ref('')
  const submitted = ref(false)
  const saving = ref(false)
  const nextId = ref(1)
  const activeUploads = new Map<number, Upload>()
  let userIdPromise: Promise<string> | null = null

  const order = computed(() => props.order)
  const canUpload = computed(() => order.value.payout_status === 'default')
  const savedImages = computed(() => order.value.order_body_images ?? [])
  const savedRemark = computed(() => order.value.order_body_remark_user?.trim() || '')
  const hasSavedEvidence = computed(() => savedImages.value.length > 0 || Boolean(savedRemark.value) || Boolean(order.value.order_body_upload_at))
  const busy = computed(() => uploadItems.value.some((item) => item.status === 'pending' || item.status === 'uploading'))
  const hasFailed = computed(() => uploadItems.value.some((item) => item.status === 'error'))
  const allUploaded = computed(() => uploadItems.value.length > 0 && uploadItems.value.every((item) => item.status === 'success' && Boolean(item.url)))
  const canSave = computed(() => canUpload.value && !submitted.value && !saving.value && !busy.value && !hasFailed.value && allUploaded.value)
  const saveLabel = computed(() => {
    if (saving.value) return '正在保存...'
    if (busy.value) return '图片上传中...'
    if (hasFailed.value) return '请重新上传失败图片'
    return '保存报销凭证'
  })
  const statusLabel = computed(() => order.value.payout_status_string?.trim() || '待提交')
  const statusClass = computed(() => statusTone(order.value.payout_status))

  function statusTone(status: string) {
    if (SUCCESS_STATUSES.has(status)) return 'bg-emerald-50 text-emerald-700'
    if (FAILED_STATUSES.has(status)) return 'bg-rose-50 text-rose-700'
    return 'bg-amber-50 text-amber-700'
  }

  function statusText(item: UploadItem) {
    if (item.status === 'pending') return '准备上传'
    if (item.status === 'uploading') return `上传中 ${item.progress}%`
    if (item.status === 'error') return item.errorMessage || '上传失败'
    return '上传成功'
  }

  function handleFileSelection(event: Event) {
    const input = event.target as HTMLInputElement
    const files = Array.from(input.files ?? [])
    input.value = ''
    if (!files.length) return

    const available = MAX_IMAGES - uploadItems.value.length
    const images = files.filter((file) => file.type.startsWith('image/')).slice(0, Math.max(available, 0))

    if (files.some((file) => !file.type.startsWith('image/'))) {
      errorMessage.value = '只能选择图片文件。'
    } else if (files.length > available) {
      errorMessage.value = `最多上传 ${MAX_IMAGES} 张图片。`
    } else {
      errorMessage.value = ''
    }

    const newItems = images.map((file) => ({
      id: nextId.value++,
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'pending' as UploadStatus,
      progress: 0,
      url: '',
      errorMessage: '',
    }))

    uploadItems.value.push(...newItems)
    for (const item of newItems) void startUpload(item.id)
  }

  async function startUpload(id: number) {
    const item = findItem(id)
    if (!item || item.status === 'uploading') return

    item.status = 'uploading'
    item.progress = 0
    item.url = ''
    item.errorMessage = ''

    try {
      const userId = await getUserId()
      if (!findItem(id)) return

      const token = await fundApi.getUploadToken(item.file)
      const url = await uploadWithTus(id, item.file, token.data.upload_url, token.file_id, userId)
      const current = findItem(id)
      if (!current) return

      current.status = 'success'
      current.progress = 100
      current.url = url
    } catch (error) {
      const current = findItem(id)
      if (!current) return

      current.status = 'error'
      current.errorMessage = await getEvidenceErrorMessage(error)
    }
  }

  function uploadWithTus(id: number, file: File, endpoint: string, fileId: string, userId: string) {
    return new Promise<string>((resolve, reject) => {
      const upload = new Upload(file, {
        endpoint,
        chunkSize: 10 * 1024 * 1024,
        retryDelays: [0, 1000],
        removeFingerprintOnSuccess: true,
        metadata: {
          user_id: userId,
          file_id: fileId,
        },
        onProgress(bytesUploaded, bytesTotal) {
          const item = findItem(id)
          if (item) item.progress = bytesTotal ? Math.round((bytesUploaded / bytesTotal) * 100) : 0
        },
        onError(error) {
          activeUploads.delete(id)
          reject(error)
        },
        onSuccess(response) {
          activeUploads.delete(id)
          try {
            const payload = JSON.parse(response.lastResponse.getBody()) as { url?: unknown }
            if (typeof payload.url !== 'string' || !payload.url) {
              throw new Error('上传成功，但没有拿到图片地址。')
            }
            resolve(payload.url)
          } catch (error) {
            reject(error)
          }
        },
      })

      activeUploads.set(id, upload)
      upload.start()
    })
  }

  function retryUpload(id: number) {
    if (saving.value) return
    void startUpload(id)
  }

  async function save() {
    if (!canSave.value) return

    errorMessage.value = ''
    saving.value = true
    try {
      await fundApi.submitEvidence(
        order.value.order_no,
        uploadItems.value.map((item) => item.url),
        remark.value.trim().slice(0, MAX_REMARK_LENGTH),
      )
      submitted.value = true
      clearItems()
      remark.value = ''
    } catch (error) {
      errorMessage.value = await getEvidenceErrorMessage(error)
    } finally {
      saving.value = false
    }
  }

  function findItem(id: number) {
    return uploadItems.value.find((item) => item.id === id)
  }

  function removeUpload(id: number) {
    const upload = activeUploads.get(id)
    if (upload) {
      void upload.abort()
      activeUploads.delete(id)
    }

    const index = uploadItems.value.findIndex((item) => item.id === id)
    if (index < 0) return

    const [removed] = uploadItems.value.splice(index, 1)
    if (removed) URL.revokeObjectURL(removed.previewUrl)
    if (!uploadItems.value.length) errorMessage.value = ''
  }

  function clearItems() {
    for (const item of uploadItems.value) {
      URL.revokeObjectURL(item.previewUrl)
    }
    uploadItems.value = []
  }

  async function getUserId() {
    if (!userIdPromise) {
      userIdPromise = user
        .fetchProfile()
        .then((profile) => {
          if (!profile?.user_id) throw new Error('用户信息暂时无法读取，请刷新后重试。')
          return profile.user_id
        })
        .catch((error: unknown) => {
          userIdPromise = null
          throw error
        })
    }

    return userIdPromise
  }

  async function getEvidenceErrorMessage(error: unknown) {
    const apiMessage = await getApiErrorMessage(error, '')
    if (apiMessage) return apiMessage
    if (error instanceof Error && error.message) return error.message
    return '凭证上传失败，请稍后重试。'
  }

  onBeforeUnmount(() => {
    for (const upload of activeUploads.values()) {
      void upload.abort()
    }
    activeUploads.clear()
    clearItems()
  })
</script>
