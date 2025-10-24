<script setup lang="ts">
  import { useDataStore } from './stores/dataStore'

  // Exceute the store to gather the books data when the app loads!
  useDataStore().fetchData();

</script>

<template>
    <router-view :key="$route.fullPath"/>
</template>

<style scoped></style>
