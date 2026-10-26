// Gera o conteúdo do post com o Gemini (chave gratuita do Google AI Studio).
// Modelos em ordem de preferência. Se o primeiro estiver sobrecarregado
// (erro 503, comum no plano gratuito), tenta o seguinte.
const MODELOS = (process.env.GEMINI_MODEL || "gemini-flash-latest,gemini-flash-lite-latest").split(",");

async function chamarGemini(prompt) {
  let ultimoErro;
  for (const modelo of MODELOS) {
    for (let tentativa = 1; tentativa <= 2; tentativa++) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`, {
          method: "POST",
          signal: AbortSignal.timeout(120000),
          headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            // Pede a resposta já em JSON, para o código conseguir ler os campos
            generationConfig: { temperature: 0.9, responseMimeType: "application/json" },
          }),
        });
        const json = await res.json();
        if (res.ok) {
          console.log(`Gemini: ${modelo}`);
          return json.candidates[0].content.parts.map((p) => p.text || "").join("");
        }
        ultimoErro = new Error(`Gemini ${res.status} (${modelo}): ${json.error?.message || JSON.stringify(json)}`);
        // Sem crédito / chave inválida: não adianta tentar outro modelo
        if (res.status === 400 || res.status === 401 || res.status === 402 || res.status === 403) throw ultimoErro;
      } catch (e) {
        if (e === ultimoErro) throw e;
        ultimoErro = e; // tempo esgotado ou falha de rede
      }
      await new Promise((r) => setTimeout(r, 4000));
    }
  }
  throw ultimoErro;
}

/**
 * Escreve um post para o Instagram.
 * Retorna { tema, etiqueta, titulo, texto, legenda, noticiaUsada }
 */
export async function gerarPost({ marca, noticias, temasUsados }) {
  const prompt = `Você é o social media da marca ${marca.nome}.

SOBRE A MARCA: ${marca.descricao}
PÚBLICO: ${marca.publico}
TOM DE VOZ: ${marca.tom}
EVITAR: ${marca.evitar}
PILARES DE CONTEÚDO: ${marca.pilares.join(" | ")}

MANCHETES RECENTES (use uma se tiver relação com a marca; se nenhuma servir, escolha um pilar):
${noticias.length ? noticias.map((n) => `- ${n}`).join("\n") : "(nenhuma encontrada)"}

TEMAS JÁ USADOS (NÃO repita nenhum, nem com outras palavras):
${temasUsados.length ? temasUsados.map((t) => `- ${t}`).join("\n") : "(nenhum ainda)"}

Crie UM post de imagem única para o Instagram.
- "tema": o assunto em até 8 palavras (vai para a lista de temas usados).
- "etiqueta": 2 a 4 palavras para o topo da arte (ex.: "Origem · Nepal").
- "titulo": frase de impacto para a arte, no máximo 60 caracteres.
- "texto": apoio para a arte, 1 ou 2 frases, no máximo 150 caracteres.
- "legenda": legenda do post, de 400 a 900 caracteres, com quebras de linha, terminando com "${marca.cta}" e depois as hashtags: ${marca.hashtags}
- "noticiaUsada": a manchete usada, ou "" se usou um pilar.
Não invente números, prêmios, datas ou fatos. Se citar notícia, fale de forma geral.

Responda só com JSON: {"tema":"","etiqueta":"","titulo":"","texto":"","legenda":"","noticiaUsada":""}`;

  const post = JSON.parse(await chamarGemini(prompt));
  for (const campo of ["tema", "titulo", "texto", "legenda"]) {
    if (!post[campo]) throw new Error(`Gemini não devolveu o campo "${campo}"`);
  }
  return post;
}
