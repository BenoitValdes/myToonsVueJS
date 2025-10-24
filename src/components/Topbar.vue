<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  showSearch: {
    type: Boolean,
    default: true
  }
});

const isActive: Boolean = ref(false);
const searchText: String = ref('');
const searchInput = ref<HTMLInputElement>(null)
const emits = defineEmits(['searchText'])

// Detect a change in the text
watch(searchText, (newValue) => {
  emits('searchText', newValue);
})


// Control the UI responsiveness.
function onSeachClick() {
  isActive.value = true;
  searchInput.value?.focus()
}

function onClearClicked() {
  searchText.value = '';
  isActive.value = false;
}

function onBlur() {
  if (!searchText.value) {
    isActive.value = false;
  }
}
</script>


<template>
  <nav class="top-nav">
    <i class="icon-logo"></i>
    MyToons
    <div v-if="props.showSearch" class="search" :class="{active: isActive}">
      <i id="search-btn" class="icon-search-solid" @click="onSeachClick"></i>
      <input
        ref="searchInput"
        type="text"
        class="search-input"
        placeholder="Search"
        v-model="searchText"
        @blur="onBlur"
      />
      <i
        id="search-clear-btn"
        class="icon-circle-xmark-solid"
        @click="onClearClicked"
      ></i>
    </div>
  </nav>
</template>


