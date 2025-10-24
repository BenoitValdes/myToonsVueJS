<script setup lang="ts">
  import router from '../router'
  import { ref, onMounted, watch } from 'vue';
  import Topbar from '../components/Topbar.vue'
  import Navbar from '../components/Navbar.vue'
  import Card from '../components/Card.vue'
  import Chapteritem from '../components/Chapteritem.vue'

  import { booksStore } from '../stores/dataStore.ts'
  import { Book } from '../models.ts'

  const props = defineProps({
    guid: String
  });

  const downloadMode = ref<Boolean>(false);
  const downloadBtn = ref<HTMLInputElement>(null);

  // Handle the download mode
  function downloadBtnClicked(){
    chapterItems.value.forEach(item => {
      const { chapter, checked } = item.getStatus();
      if (checked) {
        console.log(chapter.title);
      }      
    });
    console.log('clicked');

  }

  // Handle the Checkbox drag select
  const container = ref<HTMLInputElement>();
  const chapterList = ref<HTMLInputElement>();
  const chapterItems = ref<HTMLInputElement[]>();
  let isCheckboxDragging: Boolean = false;
  let lastClientY: Float = 0.0
  let checkValue: Boolean = true;
  let lastChecked: HTMLInputElement = null

  let scrollInterval = null;
  // Area in the top/bottom of the scroll area we'll start the autoscroll.
  const scrollThreshold: Integer = 50;
  const scrollSpeed: Integer = 10;

  function startDrag(event, isTouch: Boolean = false){
    if (!downloadMode.value) return;

    const clientX = isTouch ? event.touches[0].clientX : event.clientX;
    const rect = chapterList.value.getBoundingClientRect();
    const isValid = clientX < rect.left + 30;
    if (!isValid) return;

    let target: HTMLInputElement = null
    if (isTouch){
      target = document.elementFromPoint(
        event.touches[0].clientX,
        event.touches[0].clientY
      ).closest('.chapter-item');
    }
    else{
      target = event.target.closest('.chapter-item');
    }

    if (!target) return;

    isCheckboxDragging = true;
    const checkBox = target.querySelector('input');
    checkBox.checked = !checkBox.checked;
    checkValue = checkBox.checked;
    lastChecked = target;
    event.preventDefault();
  }

  function dragMove(clientY: Float = null) {
    if (!downloadMode.value || !isCheckboxDragging) return;
    
    // In the case we don't have access to the ClientY, then we use the 
    // lastClientY position.
    if (!clientY) {
      clientY = lastClientY;
    }
    lastClientY = clientY;

    const rect = container.value.getBoundingClientRect();

    // We want to check if we're close to the beginning or end of the rect.
    // In this case, we'll scroll a bit so we can check more checkboxes
    if (clientY - rect.top < scrollThreshold) autoScroll(-1);
    else if (clientY >= rect.bottom - scrollThreshold) autoScroll(1);
    else autoScroll(0);

    const target = document.elementFromPoint(
      rect.left, clientY)?.closest('.chapter-item');

    // Do not alter checkbox if :
    //  - chapter-item not found
    //  - we already treated the item (which avoid changing the checkbox at every movement)
    if (!target || target === lastChecked) return;    
    if (target === lastChecked) return;

    lastChecked = target;
    const checkBox = target.querySelector('input');
    checkBox.checked = checkValue;
  }

  function stopDrag() {
    if (!downloadMode.value || !isCheckboxDragging) return;
    autoScroll(0)
    isCheckboxDragging = false;
    lastChecked = null;
  }

  function autoScroll(direction: Integer) {
    // We want to stop the auto scroll
    if (direction === 0){
      clearInterval(scrollInterval);
      scrollInterval = null;
    }
    else if (!scrollInterval){
      scrollInterval = setInterval(() => {
          container.value.scrollTop += direction * scrollSpeed;
      }, 16);
    }
  }


  // Grab the page data
  const store = booksStore();
  const book = ref<Book>();

  async function findBook(){
    if (book.value) return;
    const found = store.books?.find(b => b.guid === props.guid);
    if (!found) return;
    await found.lazyLoad();
    book.value = found;
  }

  findBook();

  watch(
    store.books,
    (books) => {
      findBook();
    }
  )

</script>

<template>
    <div v-if="book" class="header">
      <img class="book-bg" :src="book.image">
      <RouterLink class="icon- back-btn" :to="'/library'" />
      <div class="layout-horizontal">
        <img class="poster" :src="book.image">
        <div class="layout-vertical">
            <h2 class="marquee">{{ book.title }}</h2>
            <div class="bottom-row">
              <i
                 v-if="false"
                ref="downloadBtn"
                  :class="downloadMode ? 'icon-cloud-xmark-solid active' : 'icon-cloud-download-regular'"
                @click="() => { downloadMode = !downloadMode }"
              ></i>
              <i
                :class="book.isFavorite() ? 'icon-heart-solid active': 'icon-heart-regular'"
                @click="() => {book.setFavorite(!book.isFavorite())}"
              ></i>
            </div>
        </div>
      </div>
    </div>
  <div
    v-if="book"
    class="container"
    ref="container"
    @mousemove="dragMove($event.clientY)"
    @touchmove="dragMove($event.touches[0].clientY, true)"
    @scroll="dragMove()"
    @mouseup="stopDrag"
    @touchend="stopDrag"
    @touchcancel="stopDrag"
  >
    <p class="synopsis">{{ book.synopsis }}</p>
    <div
      class="chapter-list"
      ref="chapterList"
      @mousedown="startDrag($event)"
      @touchstart="startDrag($event, true)"
    >
      <Chapteritem
        v-for="chapter in book.chapters"
        :key="chapter.guid"
        :chapter="chapter"
        :downloadMode="downloadMode"
        ref="chapterItems"
      />
    </div>
  </div>
  <button
   v-if="downloadMode"
   class="download"
   @click="downloadBtnClicked"
  >Download</button>
  <Navbar />
</template>
<style scoped></style>
