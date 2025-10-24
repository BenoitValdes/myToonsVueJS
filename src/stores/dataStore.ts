import { defineStore } from 'pinia'
import { ref } from 'vue'

import { loadXML } from '../utils';
import { Book, Chapter } from '../models.ts';


export const booksStore = defineStore('data', () => {
  const masterURL = 'https://raw.githubusercontent.com/BenoitValdes/manwha_rss_feeds/refs/heads/main/master.xml';
  const books = ref<Book[]>([])
  const chapters = ref<Chapter[]>([])

  async function fetchData() {
    const masterRSS = await loadXML(masterURL);
    masterRSS.querySelectorAll('item').forEach(async item => {
      books.value.push(await Book.fromMasterItem(item));
      books.value.sort((a, b) => a.title.localeCompare(b.title))
    })
  }

  return {books, fetchData }
})

export const favoriteBooksStore = defineStore('favoriteBooksStore', () => []);
export const chaptersDownloaded = defineStore('chaptersDownloaded', () => []);
export const chaptersViewed = defineStore('chaptersViewed', () => []);

