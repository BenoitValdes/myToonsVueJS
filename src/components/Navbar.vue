<script setup lang="ts">
import { useRouter } from 'vue-router'

// Props
const props = defineProps({
  current: String
})

// Router instance
const router = useRouter()

// Icons and their routes
const iconRoutes: Record<string, string> = {
  home: '/',
  library: '/library',
  favorites: '/favorites',
  downloads: '/downloads',
  settings: '/settings'
}

// Array of icons
const icons = Object.keys(iconRoutes)

// Navigation function
const goTo = (icon: string) => {
  const route = iconRoutes[icon]
  if (route) router.push(route)
}
</script>

<template>
  <nav class="bottom-nav">
    <i
      v-for="icon in icons"
      :key="icon"
      :id="icon"
      :class="['icon-', { current: icon === props.current }]"
      @click="goTo(icon)"
    ></i>
  </nav>
</template>

<style scoped>
.current {
  color: red; /* example of highlighting current icon */
}
</style>
