export const scrapeNewsData = async (url: string) => {
  try {
    // Adiciona timestamp para evitar cache do proxy e do navegador
    const timestamp = new Date().getTime();
    
    // Tenta primeiro com AllOrigins (geralmente mais estável para metadata)
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}&t=${timestamp}`;
    
    const response = await fetch(proxyUrl);
    const data = await response.json();
    
    if (!data.contents) throw new Error("No content found");

    const parser = new DOMParser();
    const doc = parser.parseFromString(data.contents, "text/html");

    // Helper to get meta content
    const getMeta = (prop: string) => 
      doc.querySelector(`meta[property="${prop}"]`)?.getAttribute('content') ||
      doc.querySelector(`meta[name="${prop}"]`)?.getAttribute('content');

    const ogTitle = getMeta('og:title') || doc.querySelector('title')?.innerText;
    const ogDesc = getMeta('og:description') || getMeta('description');
    const ogImage = getMeta('og:image');
    
    // Attempt to find site name
    const siteName = getMeta('og:site_name') || new URL(url).hostname.replace('www.', '');

    return {
      headline: ogTitle || '',
      subtitle: ogDesc || '',
      imageUrl: ogImage || '',
      siteUrl: siteName || ''
    };
  } catch (error) {
    console.error("Scraping error:", error);
    // Em caso de falha silenciosa, retornamos objetos vazios para não quebrar a UI
    throw error;
  }
};