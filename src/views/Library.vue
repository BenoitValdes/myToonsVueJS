<script setup lang="ts">
import { ref, watch } from 'vue'
  import Topbar from '../components/Topbar.vue'
  import Navbar from '../components/Navbar.vue'
  import Card from '../components/Card.vue'

  import { loadXML } from '../utils';
  import { Book } from '../models.ts';

  import { booksStore } from '../stores/dataStore'

  const props = defineProps({
    mode: String
  })


  const store = booksStore();
  const books = store.books;

  const currentSearchText = ref<String>('');
  const filteredBooks = ref<Book[]>([...books])
  
  function detectTextChange(text: String) {
    currentSearchText.value = text;

    if (text === '') {
      filteredBooks.value = [...books]
    }
    else {
      filteredBooks.value = books.filter(
        book => book.title.toLowerCase().includes(text.toLowerCase())
      );
    }
  }

  // In the case the books variable is not filled completely yet, 
  // we need to update the filteredBooks variable and keep taking into account 
  // the search filter
  watch(books, (newBook) => {
    detectTextChange(currentSearchText.value);
  })

</script>

<template>
  <Topbar @searchText="detectTextChange"/>

  <div class="container">
    <div class="grid">
      <Card
        v-for="book in filteredBooks.filter(b => {
          if (props.mode === 'library') {
            return b;
          }
          if (props.mode === 'downloads' && b.hasDownloadedChapters()) {
            return b;
          }
          if (props.mode === 'favorites' && b.isFavorite()) {
            return b;
          }
          return;
        })"
        :key="book.guid"
        :book="book"
        small
      />
      <div class="horizontal-spacer"></div>
    </div>
  </div>

  <Navbar :current="props.mode" />
</template>
<style scoped></style>
