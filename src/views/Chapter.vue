<script setup lang="ts">
  import { ref, watch, computed } from 'vue'; 
  import { booksStore } from '../stores/dataStore.ts'
  import { Chapter } from '../models.ts'
  import ChapterImage from '../components/ChapterImage.vue';

  const props = defineProps({
    bookGuid: String,
    chapterGuid: String
  })

  // --- Image Loading State ---
  // Tracks the index of the last image that has *successfully finished* loading.
  // Starting at 0 means the first image (index 0) is ready to load immediately.
  const loadedImageCount = ref<number>(0);

  // Computed property that only exposes URLs up to the last loaded index.
  // This is the core of the sequential loading logic.
  const imagesToRender = computed(() => {
    if (!chapter.value || !chapter.value.content) return [];
    // Slice the array to only include images from index 0 up to loadedImageCount - 1
    // The current image to be loaded is at index `loadedImageCount`.
    return chapter.value.content.slice(0, loadedImageCount.value + 1);
  });

  // Function called when an <img> fires its load event.
  function onImageLoad(index: number) {
    // Check if the image that just loaded is the *expected* next one in the sequence.
    if (index === loadedImageCount.value) {
      // If there are more images remaining, increment the count to expose the next URL.
      if (loadedImageCount.value + 1 < chapter.value!.content.length) {
        loadedImageCount.value++;
      }
    }
    // Note: If an image fails (onError), you might want to call this logic too to skip it.
  }

  // --- Navigation & Scroll Logic ---
  const isVisible = ref<Boolean>(true);
  const topNavBar = ref<HTMLElement | null>(null);
  const container = ref<HTMLElement | null>(null);
  const bottomNavBar = ref<HTMLElement | null>(null);

  function setNavBarVisibility(visible: Boolean) {
    if (!topNavBar.value || !bottomNavBar.value ) return
    if (visible) {
      isVisible.value = true;
      topNavBar.value.classList.remove("hidden");
      bottomNavBar.value.classList.remove("hidden");
    }
    else {
      isVisible.value = false;
      topNavBar.value.classList.add("hidden");
      bottomNavBar.value.classList.add("hidden");
    }

  }

  function containerClicked() {
    setNavBarVisibility(!isVisible.value);
  }

  function containerScrolled() {
    if (!container.value) return;
    const currentScrollY = container.value.scrollTop;
    if (currentScrollY >= container.value.scrollHeight * 0.97) {
      setNavBarVisibility(true);
      if (chapter.value) {
        chapter.value.setViewed(true)
      }
    }
    else setNavBarVisibility(false);
  }


  // --- Data Loading Logic ---
  const store = booksStore()
  const chapter = ref<Chapter | null>(null);
  const prevChapter = ref<Chapter | null>(null)
  const nextChapter = ref<Chapter | null>(null)

  async function findChapter(){
    if (chapter.value) return;

    // We need to find the book first as it contains the chapters
    const book = store.books?.find(b => b.guid === props.bookGuid);
    if (!book) return;

    // Ensure the chapters are loaded before accessing to them.
    if (book._chapters === null){
      await book.lazyLoad();
    }
    
    for (let i = 0; i < book.chapters.length; i++) {
      const chap: Chapter = book.chapters[i]!;
      if (chap && chap.guid != props.chapterGuid) continue;
      // set the chapter as we found it.
      chapter.value = chap;
      
      // Reset image loading count when a new chapter is loaded
      loadedImageCount.value = 0; 
      
      if (i != 0) {
        nextChapter.value = book.chapters[i-1]!;
      }
      if (i < book.chapters.length) {
        prevChapter.value = book.chapters[i+1]!;
      }
      // Break out of the loop once the chapter is found
      break; 
    }
  }

  findChapter();
  // If not all the chapters have been loaded yet, check if the good every 
  // time there are new loaded chapters
  watch(
    store.books,
    () => {
      findChapter();
    }
  )
</script>

<template>
  <nav ref="topNavBar" class="top-nav chapter" v-if="chapter && chapter.book">
    <RouterLink
      :to="`/book/${chapter.book.guid}`"
      class="icon- back-btn"
    />
    {{ chapter ? chapter.book.title : 'loading...' }}
  </nav>
  <div
    ref="container"
    class="container"
    @click="containerClicked"
    @scroll="containerScrolled"  
  >
    <ChapterImage 
      v-for="(image, index) in imagesToRender"
      :key="index"
      :image-url="image"
      @load="onImageLoad(index)"
      :alt-text="`Chapter Page ${index + 1}`"
      :index="index"
    />
  </div>
  <nav ref="bottomNavBar" class="bottom-nav chapter">
    <RouterLink
      :to="prevChapter ? `/book/${props.bookGuid}/chapter/${prevChapter.guid}` : ''"
      class="icon-angle-left-solid"
      :class="{invisible: !prevChapter}"
    />
    <div class="marquee"> {{ chapter ? chapter.title : 'loading...'}} </div>
    <RouterLink
      :to="nextChapter ? `/book/${props.bookGuid}/chapter/${nextChapter.guid}` : ''"
      class="icon-angle-right-solid"
      :class="{invisible: !nextChapter}"
    />
  </nav>
</template>
<style scoped></style>