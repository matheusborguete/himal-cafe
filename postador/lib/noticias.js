// Manchetes recentes do Google News (RSS gratuito, sem chave).
// Servem para o post falar de algo atual, e não só de temas genéricos.
export async function buscarNoticias(busca, max = 8) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(busca + " when:14d")}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return [];
    const xml = await res.text();
    return [...xml.matchAll(/<item>[\s\S]*?<title>([\s\S]*?)<\/title>/g)]
      .map((m) => m[1].replace(/<!\[CDATA\[|\]\]>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').trim())
      .filter(Boolean)
      .slice(0, max);
  } catch {
    return []; // sem notícias, a IA usa um dos pilares da marca
  }
}
