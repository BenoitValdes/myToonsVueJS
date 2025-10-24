import { loadXML } from "@/utils";
import { booksStore } from './stores/dataStore.ts'


function getChapterImages(chapterXml: Document) {
    const content = chapterXml.querySelector('content\\:encoded, encoded')?.textContent || '';
    const contentXml = new window.DOMParser().parseFromString(content, "text/html");
    const imgs = [...contentXml.querySelectorAll('img')];
    return [...imgs].map(img => img.getAttribute('src'));
}

function parsePubDate(date: Date): string {
    // format like 03 Sep 2025
    const formatted = date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

    // calculate "x days ago"
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let relative;
    if (diffDays === 0) {
        relative = "today";
    } else if (diffDays === 1) {
        relative = "1 day ago";
    } else if (diffDays <= 6) {
        relative = `${diffDays} days ago`;
    } else {
        relative = formatted; // fallback to the date
    }

    return relative;
}

export class Book{
    guid: string
    link: string
    title: string
    image: string
    pubdate: Date
    _chapters: Chapter[] | null = null;
    _synopsis: string | null = null;
    _new: boolean | null = null;
    _favorite: boolean | null = null;
    
    constructor(
        guid: string,
        link: string,
        title: string,
        image: string,
        pubdate: string,
    ) {
        this.guid = guid;
        this.link = link;
        this.title = title;
        this.image = image;
        this.pubdate = new Date(pubdate);
    }

    static async fromMasterItem(item: Element): Promise<Book> {
        const title = item.querySelector('title')?.textContent || '';
        const link = item.querySelector('link')?.textContent || '';
        const guid = item.querySelector('guid')?.textContent || '';
        const pubDate = item.querySelector('pubDate')?.textContent || '';
        const image = getChapterImages(item)[0];
        return new Book(guid, link, title, image, pubDate);
    }

    async lazyLoad() {
        const store = booksStore();

        const xml = await loadXML(this.link);
        this.title = xml.querySelector('channel > title')?.textContent || '';
        this.image = xml.querySelector('channel > image > url')?.textContent || '';
        this._synopsis = xml.querySelector('channel > description')?.textContent || '';
        this._chapters = await Promise.all(
            Array.from(
                xml.querySelectorAll('item') || []
            ).map(item => Chapter.fromXml(item)));

        // Propagate the book on the chapter to be able to retrieve it from 
        // the chapter.
        this.chapters.forEach(chapter => {
            chapter.book = this;
        })
    }

    get synopsis() {
        if (this._synopsis === null) {
            this.lazyLoad()
        }
        return this._synopsis;
    }

    get chapters() {
        if (this._chapters === null) {
            this.lazyLoad()
        }
        return this._chapters;
    }

    isNew(): boolean {
        if (this._new === null) {
            const now: Date = new Date();
            this._new = (
                this.pubdate.getDate() === now.getDate() &&
                this.pubdate.getMonth() === now.getMonth() &&
                this.pubdate.getFullYear() === now.getFullYear()
            )
        }
        return this._new;
    }

    isFavorite(): boolean {
        if (this._favorite === null){
            // TODO: get the data from the local storage
            this._favorite = false;
        }
        return this._favorite;
    }

    setFavorite(state: boolean) {
        this._favorite = state;
    }

    hasDownloadedChapters(): boolean {
        if (this._chapters === null){
            return false;
        }
        return this.chapters.filter(c => c.isDownloaded()).length > 0;
    }
}


export class Chapter{
    guid: string
    title: string
    content: string[]
    pubdate: Date
    viewed: boolean
    book?: Book
    _viewed: boolean | null = null;
    _dowloaded: boolean | null = null;
    
    constructor(
        guid: string,
        title: string,
        content: string[],
        pubdate: string,
        viewed: boolean = false
    ) {
        this.guid = guid;
        this.title = title;
        this.content = content;
        this.pubdate = new Date(pubdate);
        this.viewed = viewed;
    }

    static async fromXml(item: Document): Promise<Chapter> {
        const guid = item.querySelector('guid')?.textContent || '';
        const title = item.querySelector('title')?.textContent || '';
        const content = getChapterImages(item);


        const pubDate = item.querySelector('pubDate')?.textContent || '';

        return new Chapter(guid, title, content, pubDate);
    }

    getDate(): string {
        return parsePubDate(this.pubdate);
    }

    isViewed(): boolean {
        if (this._viewed === null) {
            // TODO: get the data from the local storage
        }
        return false;
    }

    isDownloaded(): boolean {
        if (this._dowloaded === null) {
            // TODO: get the data from the local storage
        }
        return false;
    }
}
