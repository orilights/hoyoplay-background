<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import PhotoSwipeLightbox from 'photoswipe/lightbox'
import 'photoswipe/style.css'

interface BackgroundUrlByGroup {
  groupName: string
  urls: string[]
}

interface ImageLoadState {
  [key: string]: boolean
}

let lightbox: PhotoSwipeLightbox | null = null
const apiBase = import.meta.env.VITE_API_BASE || ''
const apiFallback = import.meta.env.VITE_API_BASE_FALLBACK || ''

const sources = [
  {
    title: '游戏背景',
    url: '/hyp_cn_games.json',
  },
  {
    title: '启动器背景',
    url: '/hyp_cn_game_basic_info.json',
  },
]

const currentSource = ref(0)
const usingFallback = ref(false)
const imageLoadStates = ref<ImageLoadState>({})

async function fetchBackgroundData(url: string, useFallback = false): Promise<BackgroundUrlByGroup[]> {
  const baseUrl = useFallback ? apiFallback : apiBase
  const response = await fetch(baseUrl + url)

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  const arr: BackgroundUrlByGroup[] = []
  const tempObj: Record<string, string[]> = {}

  Object.keys(data).forEach((date) => {
    const year = date.slice(0, 4)
    const month = date.slice(4, 6)
    const groupName = `${year}-${month}`
    if (!tempObj[groupName]) {
      tempObj[groupName] = []
    }
    tempObj[groupName].push(data[date])
  })

  for (const groupName in tempObj) {
    arr.push({
      groupName,
      urls: tempObj[groupName]!.reverse().flat(),
    })
  }

  return arr.reverse()
}

const { data: bgData, isLoading, isError, error } = useQuery({
  queryKey: computed(() => ['backgrounds', currentSource.value]),
  queryFn: async () => {
    usingFallback.value = false
    imageLoadStates.value = {}
    try {
      return await fetchBackgroundData(sources[currentSource.value]!.url, false)
    }
    catch (err) {
      if (apiFallback) {
        console.warn('主数据源获取失败，尝试使用备用源', err)
        usingFallback.value = true
        return await fetchBackgroundData(sources[currentSource.value]!.url, true)
      }
      throw err
    }
  },
  staleTime: 1000 * 60 * 5,
})

function openUrl(url: string) {
  window.open(url, '_blank')
}

function handleImageLoad(url: string) {
  imageLoadStates.value[url] = true
}

function isImageLoaded(url: string): boolean {
  return imageLoadStates.value[url] || false
}

onMounted(() => {
  if (!lightbox) {
    lightbox = new PhotoSwipeLightbox({
      gallery: '#gallery',
      children: 'a',
      pswpModule: () => import('photoswipe'),

      arrowPrev: true,
      arrowNext: true,
    })
    lightbox.on('uiRegister', () => {
      lightbox!.pswp!.ui!.registerElement({
        name: 'download-button',
        order: 8,
        isButton: true,
        tagName: 'a',

        html: {
          isCustomSVG: true,
          inner: '<path d="M20.5 14.3 17.1 18V10h-2.2v7.9l-3.4-3.6L10 16l6 6.1 6-6.1ZM23 23H9v2h14Z" id="pswp__icn-download"/>',
          outlineID: 'pswp__icn-download',
        },

        onInit: (el, pswp) => {
          el.setAttribute('download', '')
          el.setAttribute('target', '_blank')
          el.setAttribute('rel', 'noopener')

          pswp.on('change', () => {
            (el as HTMLLinkElement).href = pswp.currSlide?.data.src || ''
          })
        },
      })
    })
    lightbox.init()
  }
})
</script>

<template>
  <div class="p-4 sm:p-8">
    <div class="flex gap-4 mb-4">
      <button
        v-for="item, index in sources" :key="index"
        class="px-4 py-2 border border-gray-300 rounded-lg transition-colors"
        :class="{
          'bg-slate-300': currentSource === index,
          'hover:bg-gray-100 cursor-pointer': currentSource !== index,
        }"
        @click="currentSource = index"
      >
        {{ item.title }}
      </button>
      <button
        class="px-4 py-2 border border-gray-300 rounded-lg transition-colors hover:bg-gray-100 cursor-pointer"

        @click="openUrl('https://github.com/orilights/hoyoplay-background')"
      >
        Github
      </button>
    </div>

    <div
      v-if="usingFallback"
      class="mb-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg text-yellow-800"
    >
      ⚠️ 当前正在使用备用数据源，可能存在更新延迟，如有疑问请前往 Github 反馈
    </div>

    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-gray-600 mb-4" />
        <p class="text-gray-600">
          加载中...
        </p>
      </div>
    </div>

    <div
      v-else-if="isError"
      class="p-4 bg-red-50 border border-red-300 rounded-lg text-red-800"
    >
      <p class="font-bold mb-2">
        ❌ 数据加载失败，请检查网络，如有疑问请前往 Github 反馈
      </p>
      <p class="text-sm">
        {{ error?.message || '未知错误' }}
      </p>
    </div>

    <div id="gallery">
      <div v-for="item in bgData" :key="item.groupName">
        <h2 class="text-2xl font-bold my-4">
          {{ item.groupName }}
        </h2>
        <div class="flex gap-4 flex-wrap">
          <a
            v-for="url, index in item.urls" :key="index"
            class="relative w-full min-w-[320px] sm:w-[320px] min-h-[180px] text-xs overflow-hidden border border-gray-300 rounded-lg bg-gray-100"
            :href="url"
            :data-pswp-width="2560"
            :data-pswp-height="1440"
            target="_blank"
            rel="noreferrer"
          >
            <div
              v-if="!isImageLoaded(url)"
              class="absolute inset-0 flex items-center justify-center bg-gray-100"
            >
              <div class="flex flex-col items-center gap-2">
                <div class="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                <span class="text-xs text-gray-500">加载中...</span>
              </div>
            </div>
            <img
              :src="`${url}?x-oss-process=image/resize,h_320`"
              class="w-full pointer-events-none transition-opacity duration-300"
              :class="isImageLoaded(url) ? 'opacity-100' : 'opacity-0'"
              loading="lazy"
              @load="handleImageLoad(url)"
            >
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
