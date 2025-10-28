<script setup lang="ts">
import {ref} from 'vue';
import {Chapter} from '../models.ts';

const props = defineProps({
    chapter: Chapter,
    downloadMode: {
        type: Boolean,
        default: false
    }
})

const checked = ref(false)

defineExpose({
  getStatus: () => {
    return {
      chapter: props.chapter,
      checked: checked.value
    }
  }
});

</script>

<template>
  <RouterLink
    v-if="props.chapter && props.chapter.book"
    :to="!props.downloadMode ? `/book/${props.chapter.book.guid}/chapter/${props.chapter.guid}` : ''"
    class="chapter-item"
    @click.prevent="props.downloadMode && $event.preventDefault()"
  >
    <label v-if="props.downloadMode" class='icon-checkbox'>
      <input type="checkbox" v-model="checked"/>
      <i class="icon-"></i>
    </label>
    <div class="chapter-info">
      <span class="marquee">{{ props.chapter.title }}</span>
      <span class="date">{{props.chapter.getDate()}}</span>
    </div>
    <i v-if="props.chapter.isViewed()" class="viewed icon-"></i>
  </RouterLink>
</template>