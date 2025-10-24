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

export const favoriteBooksStore = defineStore('favoriteBooksStore', () => {
  const books = ref<string[]>([])

  function addBook(bookGuid: string) {
    books.value.push(bookGuid)
  }

  function removeBook(bookGuid: string) {
    books.value = books.value.filter(b => b !== bookGuid)
  }
  return { books, addBook, removeBook };
});

export const chaptersDownloaded = defineStore('chaptersDownloaded', () => []);

export const chaptersViewed = defineStore('chaptersViewed', () => {
  const chapters = ref<string[]>([])

  function addChapter(chapterGuid: string) {
    if (!chapters.value.includes(chapterGuid)) {
      chapters.value.push(chapterGuid)
    }
  }

  function removeChapter(chapterGuid: string) {
    chapters.value = chapters.value.filter(b => b !== chapterGuid)
  }
  return { chapters, addChapter, removeChapter };
});

