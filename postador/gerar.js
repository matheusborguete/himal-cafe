// PASSO 1 — Gera um post e manda para aprovação no Telegram.
// Uso: npm run gerar   (no GitHub Actions roda sozinho todo dia)
//
// pauta (Google News) → texto (Gemini) → arte (template, sem IA)
//   → salva no GitHub (URL pública da imagem) → Telegram com botões
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { buscarNoticias } from "./lib/noticias.js";
import { gerarPost } from "./lib/gemini.js";
import { desenharSlide, listarTemplates } from "./lib/slide.js";
import { lerPosts, gravarPosts, atualizarPost, temasRecentes, marca, RAIZ } from "./lib/estado.js";
import { salvarNoGitHub, urlPublica } from "./lib/github.js";
import { enviarRascunho } from "./lib/telegram.js";

export async function gerarEEnviar() {
  const m = marca();
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId) throw new Error("Falta TELEGRAM_CHAT_ID. Rode 'npm run verificar' depois de mandar um oi para o bot.");

  // 1. Pauta atual
  const busca = m.buscasDeNoticias[Math.floor(Math.random() * m.buscasDeNoticias.length)];
  const noticias = await buscarNoticias(busca);
  console.log(`Busca "${busca}": ${noticias.length} manchetes`);

  // 2. Texto com IA (sem repetir temas)
  const conteudo = await gerarPost({ marca: m, noticias, temasUsados: temasRecentes() });
  console.log(`Tema: ${conteudo.tema}`);

  // 3. Arte com o próximo template da fila (alterna entre os cadastrados)
  const posts = lerPosts();
  const templates = listarTemplates();
  const template = templates[posts.length % templates.length];
  const id = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14); // ex.: 20261028190512
  const imagem = desenharSlide({ ...conteudo, template });
  const arquivo = `imagens/${id}.jpg`;
  writeFileSync(join(RAIZ, arquivo), imagem);

  const post = { id, status: "aguardando", criadoEm: new Date().toISOString(), template: template.nome, imagem: arquivo, ...conteudo };
  gravarPosts([...posts, post]);

  // 4. Sobe para o GitHub: a imagem passa a ter uma URL pública
  const sha = salvarNoGitHub(`post ${id}: ${conteudo.tema}`);
  post.imagemUrl = urlPublica(sha, arquivo);

  // 5. Rascunho no Telegram
  post.telegramMsgId = await enviarRascunho({ chatId, post, imagem });
  atualizarPost(id, { imagemUrl: post.imagemUrl, telegramMsgId: post.telegramMsgId });
  salvarNoGitHub(`post ${id}: enviado ao Telegram`);
  console.log(`Rascunho ${id} enviado ao Telegram`);
  return post;
}

// Executa quando chamado direto (node gerar.js)
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  gerarEEnviar().catch((e) => { console.error(e.message); process.exit(1); });
}
