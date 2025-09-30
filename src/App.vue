<script setup lang="ts">
import PhotoSwipeLightbox from 'photoswipe/lightbox'
import 'photoswipe/style.css'

interface BackgroundUrlByGroup {
  groupName: string
  urls: string[]
}

let lightbox: PhotoSwipeLightbox | null = null
const apiBase = 'https://autopatch.hk4e.com/api_tracker/images'

const sources = [
  {
    title: '游戏选择背景',
    url: '/hyp_cn_games.json',
  },
  {
    title: '启动器背景',
    url: '/hyp_cn_game_basic_info.json',
  },
]

const bgData = ref<BackgroundUrlByGroup[]>([])

const currentSource = ref(0)

function fetchData() {
  fetch(apiBase + sources[currentSource.value]!.url)
    .then(res => res.json())
    .then((data) => {
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
      bgData.value = arr.reverse()
    })
}

function openUrl(url: string) {
  window.open(url, '_blank')
}

onMounted(() => {
  fetchData()
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

        // SVG with outline
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
    <div class="flex gap-4 mb-8">
      <button
        v-for="item, index in sources" :key="index"
        class="px-4 py-2 border border-gray-300 rounded-lg transition-colors"
        :class="{
          'bg-slate-300': currentSource === index,
          'hover:bg-gray-100 cursor-pointer': currentSource !== index,
        }"
        @click="currentSource = index; fetchData()"
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

    <div id="gallery">
      <div v-for="item in bgData" :key="item.groupName">
        <h2 class="text-2xl font-bold my-4">
          {{ item.groupName }}
        </h2>
        <div class="flex gap-4 flex-wrap">
          <a
            v-for="url, index in item.urls" :key="index"
            class="w-full min-w-[320px] sm:w-[320px] min-h-[180px] text-xs overflow-hidden border border-gray-300 rounded-lg"
            :href="url"
            :data-pswp-width="2560"
            :data-pswp-height="1440"
            target="_blank"
            rel="noreferrer"
          >
            <img :src="`${url}?x-oss-process=image/resize,h_320`" class="w-full pointer-events-none" loading="lazy">
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
