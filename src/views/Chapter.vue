<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { booksStore } from '../stores/dataStore.ts'
  import { Chapter } from '../models.ts'

  const props = defineProps({
    bookGuid: String,
    chapterGuid: String
  })

  // Handle nav bar animation
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


  // Handle data loading
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
      
      if (i != 0) {
        nextChapter.value = book.chapters[i-1]!;
      }
      if (i < book.chapters.length) {
        prevChapter.value = book.chapters[i+1]!;
      }
    }
  }

  findChapter();
  // If not all the chapters have been loaded yet, check if the good every 
  // time there are new loaded chapters
  watch(
    store.books,
    (book) => {
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
    <img 
      v-if="chapter"
      v-for="image in chapter.content"
      :src="image"
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
