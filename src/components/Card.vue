<script setup lang="ts">
  import { Book } from '../models.ts';

  const props = defineProps({
    book: Book,
    new: {
      type: Boolean,
      default: false
    },
    small: {
      type: Boolean,
      default: false
    }
  })
</script>

<template>
  <RouterLink 
    v-if="props.book"
    :to="`/book/${props.book.guid}`"
    class="card"
    :class="{new: props.new, small: props.small}"
  >
    <img :src="props.book.image">
    <span>{{ props.book.title }}</span>
  </RouterLink>
</template>