<script setup lang="ts">
  import Topbar from '../components/Topbar.vue'
  import Navbar from '../components/Navbar.vue'
  import Card from '../components/Card.vue'

  import { booksStore } from '../stores/dataStore'

  const store = booksStore()
  const books = store.books

</script>

<template>
  <Topbar :showSearch="false"/>

  <div class="container">
      <p class="section-header">Continue Reading</p>
      <div>
        <div class="horizontal-flow">
          <Card
          v-for="book in books"
          :key="book.guid"
          :book="book"
          />
        </div>
      </div>
      <div v-if="books.filter(b => b.isFavorite()).length > 0">
        <p class="section-header">Favorites Toons</p>
        <div class="horizontal-flow">
          <Card
          v-for="book in books.filter(b => b.isFavorite())"
          :key="book.guid"
          :book="book"
          />
        </div>
      </div>
      <div v-if="books.filter(b => b.isNew()).length > 0">
        <p class="section-header">>New Releases</p>
        <div class="horizontal-flow">
          <Card
          v-for="book in books.filter(b => b.isNew())"
          :key="book.guid"
          :book="book"
          />
        </div>
      </div>
  </div>
  <Navbar current="home" />
</template>
<style scoped></style>
