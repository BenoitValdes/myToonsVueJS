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
  <div class="image-wrapper">
    <Loader v-if="status === 'loading'" class="loading-spinner"/>
    <p v-else-if="status === 'failed'">
      Image failed to load (Index {{ index }})
    </p>
  </div>
</template>

<style scoped>
/* .image-wrapper {
  position: relative;
  min-height: 400px; 
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

img {
  max-width: 100%;
  display: block;
  opacity: 0; 
  transition: opacity 0.3s;
}

img.loaded {
  opacity: 1;
}

.loading-spinner, .loading-failed {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-spinner p {
  font-weight: bold;
} */
</style>