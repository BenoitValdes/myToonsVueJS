export async function loadXML(url: string) {
    const res = await fetch(url, {cache: "no-store"});
    if (!res.ok) throw new Error('Fail to load ' + url);
    const text = await res.text();
    return new window.DOMParser().parseFromString(text, "application/xml");
}