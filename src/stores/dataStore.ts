import { defineStore } from 'pinia'
import { ref } from 'vue'

import { loadXML } from '../utils';
import { Book, Chapter } from '../models.ts';


export const useDataStore = defineStore('data', () => {
  const masterURL = 'https://raw.githubusercontent.com/BenoitValdes/manwha_rss_feeds/refs/heads/main/master.xml';
  const books = ref<Book[]>([])
  const chapters = ref<Chapter[]>([])

  async function fetchData() {
    const masterRSS = await loadXML(masterURL);

    const subRSS = [...masterRSS.querySelectorAll('item > link')].map(
      link => link.textContent);

    subRSS.forEach(async url => {
      const book = await Book.fromUrl(url);
      books.value.push(book);
      chapters.value.push(...book.chapters);
      books.value.sort((a, b) => a.title.localeCompare(b.title))
      
    });
  }

  return { books, chapters, fetchData }
})