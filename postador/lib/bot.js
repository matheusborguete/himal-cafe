// O que o bot faz com cada clique ou mensagem recebida no Telegram.
// Usado pelo verificar.js (GitHub Actions) e pelo escutar.js (ao vivo na aula).
import { telegram, mensagem, removerBotoes } from "./telegram.js";
import { publicarImagem } from "./instagram.js";
import { lerPosts, atualizarPost, lerOffset, gravarOffset } from "./estado.js";
import { salvarNoGitHub } from "./github.js";
import { gerarEEnviar } from "../gerar.js";

/**
 * Lê as novidades do Telegram e reage a elas.
 * @param {number} espera  segundos aguardando novidades (0 = só olha e sai)
 * @returns {number} quantas novidades foram tratadas
 */
export async function processarNovidades(espera = 0) {
  const chatPermitido = process.env.TELEGRAM_CHAT_ID;
  const novidades = await telegram("getUpdates", {
    offset: lerOffset(),
    timeout: espera,
    allowed_updates: ["message", "callback_query"],
  });

  for (const n of novidades) {
    gravarOffset(n.update_id + 1);
    const chatId = String(n.message?.chat.id ?? n.callback_query?.message.chat.id ?? "");

    // Primeira configuração: ainda não sabemos qual é o seu chat
    if (!chatPermitido) {
      console.log(`Chat encontrado: TELEGRAM_CHAT_ID=${chatId}`);
      await mensagem(chatId, `Olá! Seu TELEGRAM_CHAT_ID é ${chatId}\nCopie esse número para o .env e para os Secrets do GitHub.`);
      continue;
    }
    if (chatId !== String(chatPermitido)) continue; // ignora estranhos

    try {
      if (n.callback_query) await tratarBotao(n.callback_query, chatId);
      else if (n.message?.text?.startsWith("/gerar")) {
        await mensagem(chatId, "Gerando um post novo…");
        await gerarEEnviar();
      } else if (n.message?.text) {
        await mensagem(chatId, "Comandos: /gerar cria um post novo. Use os botões dos rascunhos para aprovar.");
      }
    } catch (e) {
      console.error(e);
      await mensagem(chatId, `⚠️ Erro: ${e.message}`);
    }
  }

  if (novidades.length) salvarNoGitHub("bot: atualiza estado do Telegram");
  return novidades.length;
}

async function tratarBotao(clique, chatId) {
  const [acao, id] = clique.data.split(":");
  await telegram("answerCallbackQuery", { callback_query_id: clique.id }).catch(() => {});
  await removerBotoes(chatId, clique.message.message_id);

  const post = lerPosts().find((p) => p.id === id);
  if (!post || post.status !== "aguardando") {
    await mensagem(chatId, "Esse rascunho já foi resolvido.");
    return;
  }

  if (acao === "aprovar") {
    await mensagem(chatId, "Publicando no Instagram…");
    try {
      const { id: igId, permalink } = await publicarImagem(post.imagemUrl, post.legenda);
      atualizarPost(id, { status: "publicado", publicadoEm: new Date().toISOString(), igId, permalink });
      await mensagem(chatId, `✅ Publicado!\n${permalink}`);
    } catch (e) {
      atualizarPost(id, { status: "erro", erro: e.message });
      throw e;
    }
  }

  if (acao === "outro") {
    atualizarPost(id, { status: "descartado" });
    salvarNoGitHub(`post ${id}: descartado`);
    await mensagem(chatId, "Ok, descartado. Gerando outro…");
    await gerarEEnviar();
  }
}
