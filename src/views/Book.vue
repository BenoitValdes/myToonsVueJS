<script setup lang="ts">
  import router from '../router'
  import { ref, onMounted, watch } from 'vue';
  import Navbar from '../components/Navbar.vue'
  import Chapteritem from '../components/Chapteritem.vue'
  import BookDetailLoader from '../components/BookDetailLoader.vue'

  import { booksStore } from '../stores/dataStore.ts'
  import { Book } from '../models.ts'

  const props = defineProps({
    guid: String
  });

  const downloadMode = ref<Boolean>(false);
  const downloadBtn = ref<HTMLInputElement | null>(null);

  // Handle the download mode
  function downloadBtnClicked(){
      // TODO: Loop overt all the chapterItems
      //  Get their checkbox status
      //  if checked, download if not already downloaded (check the model)
      //. if unchecked, remove in downloaded (check the model)

      // TODO: to donwload, try to use the service worker by adding new images 
      // hidden and let the service worker it needs to store them. THis will 
      // avoid opaque response like in the v1
  }

  // Handle the Checkbox drag select
  const container = ref<HTMLElement>();
  const chapterList = ref<HTMLElement>();
  const chapterItems = ref<HTMLElement[]>();
  let isCheckboxDragging: Boolean = false;
  let lastClientY: number = 0.0;
  let checkValue: boolean = true;
  let lastChecked: HTMLElement | null = null

  let scrollInterval: number | null = null;
  // Area in the top/bottom of the scroll area we'll start the autoscroll.
  const scrollThreshold: number = 50;
  const scrollSpeed: number = 10;

  function getMouseTarget(
    event: MouseEvent,
    clientRect: DOMRect): HTMLElement | undefined {
    const clientX = event.clientX;
    const isValid = clientX < clientRect.left + 30;
    if (!isValid) return undefined;
    return event.target as HTMLElement | undefined;
  }

  function getTouchTarget(
    event: TouchEvent,
    clientRect: DOMRect): HTMLElement | undefined {
    const clientX = event.touches[0]?.clientX || -1;
    const clientY = event.touches[0]?.clientY || -1;
    const isValid = clientX < clientRect.left + 30;
    if (!isValid) return;
    return document.elementFromPoint(clientX, clientY) as HTMLElement | undefined;
  }  

  function startDrag(event: MouseEvent | TouchEvent){
    if (!downloadMode.value || !chapterList.value) return;
    const rect = chapterList.value.getBoundingClientRect();

    let target: HTMLElement | undefined;

    if (event instanceof MouseEvent) {
      target = getMouseTarget(event, rect);
    }
    else {
      target = getTouchTarget(event, rect);
    }

    if (!target) return;
    const chapterItem = target.closest<HTMLElement>('.chapter-item');
    if (!chapterItem) return;

    isCheckboxDragging = true;
    const checkBox = chapterItem.querySelector('input')!;
    checkBox.checked = !checkBox.checked;
    checkValue = checkBox.checked;
    lastChecked = chapterItem;
    event.preventDefault();
  }

  function dragMove(clientY: number | null = null) {
    if (!downloadMode.value || !isCheckboxDragging || ! container.value) return;
    
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
      rect.left, clientY)?.closest<HTMLElement>('.chapter-item');

    // Do not alter checkbox if :
    //  - chapter-item not found
    //  - we already treated the item (which avoid changing the checkbox at every movement)
    if (!target || target === lastChecked) return;    
    if (target === lastChecked) return;

    lastChecked = target;
    const checkBox = target.querySelector('input')!;
    checkBox.checked = checkValue;
  }

  function stopDrag() {
    if (!downloadMode.value || !isCheckboxDragging) return;
    autoScroll(0)
    isCheckboxDragging = false;
    lastChecked = null;
  }

  function autoScroll(direction: number) {
    // We want to stop the auto scroll
    if (direction === 0 && scrollInterval){
      clearInterval(scrollInterval);
      scrollInterval = null;
    }
    else if (!scrollInterval && container.value){
      // Capture the element to type check it correctly
      const el = container.value;
      scrollInterval = setInterval(() => {
          el.scrollTop += direction * scrollSpeed;
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
                @click="() => {book ? book.setFavorite(!book.isFavorite()) : ''}"
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
    @touchmove="dragMove($event.touches[0]?.clientY)"
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
      @touchstart="startDrag($event)"
    >
      <Chapteritem
        v-for="chapter in book.chapters"
        :key="chapter.guid"
        :chapter="chapter"
        :downloadMode="downloadMode ? true : false"
        ref="chapterItems"
      />
    </div>
  </div>
  <div class="container" v-else>
    <BookDetailLoader />
  </div>
  <button
   v-if="downloadMode"
   class="download"
   @click="downloadBtnClicked"
  >Download</button>
  <Navbar />
</template>
<style scoped></style>
