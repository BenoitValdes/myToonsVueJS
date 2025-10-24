import { loadXML } from "@/utils";


function stringToGUID(str: string): string {
    let hash = 0n;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 31n + BigInt(str.charCodeAt(i))) & 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFn;
    }
    return hash.toString(16).padStart(40, '0');
}

function getChapterImages(chapterXml: Document) {
    const content = chapterXml.querySelector('content\\:encoded, encoded')?.textContent || '';
    const contentXml = new window.DOMParser().parseFromString(content, "text/html");
    const imgs = [...contentXml.querySelectorAll('img')];
    return [...imgs].map(img => img.getAttribute('src'));
}

function parsePubDate(pubDateStr: Date): string {
    const date = new Date(pubDateStr);

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
    synopsis: string
    pubdate: Date
    chapters: Chapter[]
    _new: boolean | null = null;
    _favorite: boolean | null = null;
    
    constructor(
        guid: string,
        link: string,
        title: string,
        image: string,
        synopsis: string,
        pubdate: string,
        chapters: Chapter[]
    ) {
        this.guid = guid;
        this.link = link;
        this.title = title;
        this.image = image;
        this.synopsis = synopsis;
        this.pubdate = new Date(pubdate);
        this.chapters = chapters;

        // Propagate the book on the chapter to be able to retrieve it from 
        // the chapter.
        this.chapters.forEach(chapter => {
            chapter.book = this;
        })

    }

    static async fromUrl(url: string): Promise<Book> {
        const xml = await loadXML(url)
        const title = xml.querySelector('channel > title')?.textContent || '';
        const image = xml.querySelector('channel > image > url')?.textContent || '';
        const synopsis = xml.querySelector('channel > description')?.textContent || '';
        const pubDate = xml.querySelector('channel > pubDate')?.textContent || '';
        const guid = await stringToGUID(url);
        const chapters = await Promise.all(Array.from(xml.querySelectorAll('item') || []).map(item => Chapter.fromXml(item)));
        return new Book(guid, url, title, image, synopsis, pubDate, chapters);
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
