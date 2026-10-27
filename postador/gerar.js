// SPRINT 3 — Gera um post e manda para aprovação no Telegram.
// Uso: npm run gerar   e depois   npm run escutar
//
// pauta (Google News) → texto (Gemini) → arte (template, sem IA) → Telegram com botões
// Próxima etapa: sprint-4 publica no Instagram quando você aprova.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { buscarNoticias } from "./lib/noticias.js";
import { gerarPost } from "./lib/gemini.js";
import { desenharSlide } from "./lib/slide.js";
import { carregarMarca, carregarTemplates } from "./lib/config.js";
import { lerPosts, gravarPosts, atualizarPost, temasRecentes, RAIZ } from "./lib/estado.js";
import { enviarRascunho } from "./lib/telegram.js";

export async function gerarEEnviar() {
  const m = await carregarMarca(); // configurada no painel /admin → aba Postador
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
  const templates = await carregarTemplates();
  const template = templates[posts.length % templates.length];
  const id = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14); // ex.: 20261028190512
  const imagem = desenharSlide({ ...conteudo, template, marca: m });
  const arquivo = `imagens/${id}.jpg`;
  writeFileSync(join(RAIZ, arquivo), imagem);

  const post = { id, status: "aguardando", criadoEm: new Date().toISOString(), template: template.nome, imagem: arquivo, ...conteudo };
  gravarPosts([...posts, post]);

  // 4. Rascunho no Telegram (a foto vai direto do computador)
  post.telegramMsgId = await enviarRascunho({ chatId, post, imagem });
  atualizarPost(id, { telegramMsgId: post.telegramMsgId });
  console.log(`Rascunho ${id} enviado ao Telegram`);
  return post;
}

// Executa quando chamado direto (node gerar.js)
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  gerarEEnviar().catch((e) => { console.error(e.message); process.exit(1); });
}
