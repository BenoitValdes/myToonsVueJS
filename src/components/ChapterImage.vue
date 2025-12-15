<script setup lang="ts">
import { ref } from 'vue';
import Loader from './Loader.vue'

const props = defineProps<{
  imageUrl: string;
  altText: string;
  index: number; 
}>();

const emit = defineEmits<{
  (event: 'load', index: number): void;
}>();

type LoadingStatus = 'loading' | 'loaded' | 'failed';
const status = ref<LoadingStatus>('loading');

function onImageLoad() {
  status.value = 'loaded';
  emit('load', props.index);
}

function onImageError() {
  status.value = 'failed';
  emit('load', props.index);
}

</script>

<template>
  <div v-if="status !== 'loaded'" class="image-wrapper">
    <Loader v-if="status === 'loading'" class="loading-spinner"/>
    <div v-else-if="status === 'failed'">
      <p>Image failed to load: {{ altText }}</p>
    </div>
  </div>  
  <img
    v-if="status !== 'failed'"
    :src="imageUrl"
    :alt="altText"
    @load="onImageLoad"
    @error="onImageError"
    :class="{ 'loaded': status === 'loaded' }"
    :key="imageUrl + status"
  />

</template>

<style scoped>
  .image-wrapper {
    min-height: 400px; 
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    flex-direction: column;
  }
</style>