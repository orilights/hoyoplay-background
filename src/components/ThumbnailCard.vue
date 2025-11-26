<script setup lang="ts">
import type { BackgroundData } from '@/App.vue'

interface Props {
  data: BackgroundData
}

const props = defineProps<Props>()

const isLoaded = ref(false)
const isHovered = ref(false)
const videoRef = ref<HTMLVideoElement>()

const isVideo = computed(() => props.data.type === 'video')

const videoUrl = computed(() => {
  if (!isVideo.value)
    return ''
  return props.data.url
})

const imageUrl = computed(() => {
  if (!isVideo.value)
    return props.data.url
  return props.data.cover_url
})

const thumbnailUrl = computed(() => {
  // launcher-webstatic.hoyoverse.com 域名源站非 OSS，无法使用图片处理参数，使用自有 API 生成缩略图
  if (imageUrl.value?.startsWith('https://launcher-webstatic.hoyoverse.com'))
    return `${import.meta.env.VITE_API_THUMBNAIL}${imageUrl.value}`

  return `${imageUrl.value}?x-oss-process=image/resize,h_320`
})

const targetUrl = computed(() => {
  return isVideo.value ? videoUrl.value : props.data.url
})

function handleImageLoad() {
  isLoaded.value = true
}

async function handleMouseEnter() {
  if (!isVideo.value || !videoRef.value)
    return

  isHovered.value = true

  try {
    await videoRef.value.play()
  }
  catch (error) {
    console.warn('视频播放失败:', error)
  }
}

function handleMouseLeave() {
  if (!isVideo.value || !videoRef.value)
    return

  isHovered.value = false
  videoRef.value.pause()
  videoRef.value.currentTime = 0
}

function formatBytes(bytes: number) {
  if (bytes < 1024)
    return `${bytes} B`
  else if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(2)} KB`
  else
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
</script>

<template>
  <a
    class="relative w-full min-w-[320px] sm:w-[320px] min-h-[180px] text-xs overflow-hidden border border-gray-300 rounded-lg bg-gray-100 group"
    :class="isVideo ? 'video' : 'image'" :href="targetUrl" :data-pswp-width="2560" :data-pswp-height="1440"
    target="_blank" rel="noreferrer" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave"
  >
    <!-- 加载提示 -->
    <div v-if="!isLoaded" class="absolute inset-0 flex items-center justify-center bg-gray-100">
      <div class="flex flex-col items-center gap-2">
        <div class="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        <span class="text-xs text-gray-500">
          加载中...
        </span>
      </div>
    </div>

    <!-- 预览图 -->
    <img
      v-show="!isVideo || !isHovered" :src="thumbnailUrl"
      class="w-full pointer-events-none transition-opacity duration-300" :class="isLoaded ? 'opacity-100' : 'opacity-0'"
      loading="lazy" @load="handleImageLoad"
    >

    <!-- 视频预览 -->
    <video
      v-if="isVideo" v-show="isHovered" ref="videoRef" :src="videoUrl"
      class="w-full h-full object-cover pointer-events-none transition-opacity duration-300" muted loop
      preload="metadata"
    />

    <!-- 信息标签 -->
    <div
      class="absolute bottom-2 left-2 flex gap-1 text-white text-[10px] leading-[12px] transition-opacity duration-300"
      :class="isLoaded ? 'opacity-100' : 'opacity-0'"
    >
      <div v-if="isVideo" class=" bg-black/60 rounded-lg p-1 ">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-3 text-white">
          <path
            fill-rule="evenodd"
            d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
            clip-rule="evenodd"
          />
        </svg>
      </div>

      <div class="bg-black/60 rounded-lg p-1">
        {{ data.metadata.format }}<template v-if="data.metadata.mode">-{{ data.metadata.mode }}</template>
      </div>

      <div v-if="data.metadata.width && data.metadata.height" class="bg-black/60 rounded-lg p-1">
        {{ `${data.metadata.width}×${data.metadata.height}` }}<span v-if="data.metadata.framerate">{{
          `@${data.metadata.framerate}fps` }}</span>
      </div>

      <div v-if="data.metadata.size" class="bg-black/60 rounded-lg p-1">
        {{ formatBytes(data.metadata.size) }}
      </div>

    </div>
  </a>
</template>

<style scoped></style>
