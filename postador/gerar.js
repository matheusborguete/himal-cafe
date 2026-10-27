// SPRINT 2 — Gera um post e salva a arte no computador.
// Uso: npm run gerar
//
// pauta (Google News) → texto (Gemini) → arte (template, sem IA)
// Próximas etapas: sprint-3 manda para o Telegram, sprint-4 publica no Instagram.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { buscarNoticias } from "./lib/noticias.js";
import { gerarPost } from "./lib/gemini.js";
import { desenharSlide } from "./lib/slide.js";
import { carregarMarca, carregarTemplates } from "./lib/config.js";
import { lerPosts, gravarPosts, temasRecentes, RAIZ } from "./lib/estado.js";

export async function gerar() {
  const m = await carregarMarca(); // configurada no painel /admin → aba Postador

  // 1. Pauta atual
  const busca = m.buscasDeNoticias[Math.floor(Math.random() * m.buscasDeNoticias.length)];
  const noticias = await buscarNoticias(busca);
  console.log(`Busca "${busca}": ${noticias.length} manchetes`);

  // 2. Texto com IA (sem repetir temas)
  const conteudo = await gerarPost({ marca: m, noticias, temasUsados: temasRecentes() });

  // 3. Arte com o próximo template da fila (alterna entre os cadastrados)
  const posts = lerPosts();
  const templates = await carregarTemplates();
  const template = templates[posts.length % templates.length];
  const id = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14); // ex.: 20261028190512
  const arquivo = `imagens/${id}.jpg`;
  writeFileSync(join(RAIZ, arquivo), desenharSlide({ ...conteudo, template, marca: m }));

  const post = { id, status: "gerado", criadoEm: new Date().toISOString(), template: template.nome, imagem: arquivo, ...conteudo };
  gravarPosts([...posts, post]);
  console.log(JSON.stringify(post, null, 2));
  console.log(`\nArte salva em postador/${arquivo}`);
  return post;
}

// Executa quando chamado direto (node gerar.js)
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  gerar().catch((e) => { console.error(e.message); process.exit(1); });
}
