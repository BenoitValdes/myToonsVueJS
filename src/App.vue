<script setup lang="ts">
  import {
    booksStore,
    favoriteBooksStore,
    chaptersDownloaded,
    chaptersViewed 
  } from './stores/dataStore'

  function installSerializeDeserialize(store: StoreDefinition, storeKey: string) {
    // deserialize
    const storageData = localStorage.getItem(storeKey)
    if (storageData) store.$patch(JSON.parse(storageData));

    // serialize
    store.$subscribe((_mutation, state) => {
      // console.log(storeKey, state);
      localStorage.setItem(storeKey, JSON.stringify(state))
  })

  }

  // Exceute the store to gather the books data when the app loads!
  booksStore().fetchData();

  // Get the store from local store and install the deserialize/serialize behavior
  installSerializeDeserialize(favoriteBooksStore(), 'favorite_books');
  installSerializeDeserialize(chaptersDownloaded(), 'chapters_downloaded');
  installSerializeDeserialize(chaptersViewed(), 'chapters_viewed');

</script>

<template>
    <router-view :key="$route.fullPath"/>
</template>

<style scoped></style>
