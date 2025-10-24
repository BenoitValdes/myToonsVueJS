<script setup lang="ts">
  import router from '../router'
  import { ref, onMounted, watch } from 'vue';
  import Topbar from '../components/Topbar.vue'
  import Navbar from '../components/Navbar.vue'
  import Card from '../components/Card.vue'
  import Chapteritem from '../components/Chapteritem.vue'

  import { useDataStore } from '../stores/dataStore.ts'
  import { Chapter } from '../models.ts'

  const props = defineProps({
    guid: String
  })

  // Handle nav bar animation
  const isVisible = ref<Boolean>(true);
  const topNavBar = ref<HTMLInputElement>(null);
  const container = ref<HTMLInputElement>(null);
  const bottomNavBar = ref<HTMLInputElement>(null);

  function setNavBarVisibility(visible: Boolean) {
    if (!topNavBar || !bottomNavBar ) return
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
    setNavBarVisibility(false);

  }


  // Handle data loading
  const store = useDataStore()
  const chapter = ref<Chapter>(null);
  const prevChapter = ref<Chapter>(null)
  const nextChapter = ref<Chapter>(null)

  function findChapter(){
    if (chapter.value) return;
    const found = store.chapters?.find(b => b.guid === props.guid);
    if (found) {
      chapter.value = found;
      const book = found.book;
      console.log(book);
      console.log(found.guid);

      for (let i = 0; i < book.chapters.length; i++) {
        const chap = book.chapters[i];
        if (chap.guid != found.guid) continue;
        if (i != 0) {
          nextChapter.value = book.chapters[i-1];
        }
        if (i < book.chapters.length) {
          prevChapter.value = book.chapters[i+1];
        }
        console.log(prevChapter.value?.title, nextChapter.value?.title)
      }
    }
  }

  findChapter();
  // If not all the chapters have been loaded yet, check if the good every 
  // time there are new loaded chapters
  watch(
    store.chapters,
    (chapters) => {
      findChapter();
    }
  )
</script>

<template>
  <nav ref="topNavBar" class="top-nav chapter">
    <RouterLink
      v-if="chapter"
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
      :to="prevChapter ? `/chapter/${prevChapter.guid}` : ''"
      class="icon-angle-left-solid"
      :class="{invisible: !prevChapter}"
    />
    {{ chapter ? chapter.title : 'loading...'}}
    <RouterLink
      :to="nextChapter ? `/chapter/${nextChapter.guid}` : ''"
      class="icon-angle-right-solid"
      :class="{invisible: !nextChapter}"
    />

  </nav>
</template>
<style scoped></style>
