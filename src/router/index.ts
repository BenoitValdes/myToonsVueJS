import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue';
import Library from '../views/Library.vue';
import Book from '../views/Book.vue';
import Chapter from '../views/Chapter.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Home},
    { path: '/library', component: Library, props: {mode: "library"}},
    { path: '/favorites', component: Library, props: {mode: "favorites"}},
    { path: '/downloads', component: Library, props: {mode: "downloads"}},
    // { path: '/settings', component: Settings},
    { path: '/book/:guid', component: Book, props:true},
    { path: '/chapter/:guid', component: Chapter, props:true},
  ],
})

export default router
