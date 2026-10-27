// O que o bot faz com cada clique ou mensagem recebida no Telegram.
// Usado pelo verificar.js (olha uma vez) e pelo escutar.js (fica ouvindo).
// SPRINT 3: Aprovar só marca o post como aprovado. A publicação entra na sprint-4.
import { telegram, mensagem, removerBotoes } from "./telegram.js";
import { lerPosts, atualizarPost, lerOffset, gravarOffset } from "./estado.js";
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
      await mensagem(chatId, `Olá! Seu TELEGRAM_CHAT_ID é ${chatId}\nCopie esse número para o .env.`);
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
    atualizarPost(id, { status: "aprovado", aprovadoEm: new Date().toISOString() });
    await mensagem(chatId, "✅ Aprovado! Na sprint-4 este clique publica no Instagram.");
  }

  if (acao === "outro") {
    atualizarPost(id, { status: "descartado" });
    await mensagem(chatId, "Ok, descartado. Gerando outro…");
    await gerarEEnviar();
  }
}
