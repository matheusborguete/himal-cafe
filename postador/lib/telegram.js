// Conversa com o bot do Telegram (token gerado no @BotFather).
const api = (metodo) => `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${metodo}`;

export async function telegram(metodo, dados = {}) {
  const res = await fetch(api(metodo), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(`Telegram ${metodo}: ${json.description}`);
  return json.result;
}

// Envia a arte + legenda com os botões de aprovação
export async function enviarRascunho({ chatId, post, imagem }) {
  const form = new FormData();
  form.append("chat_id", chatId);
  form.append("photo", new Blob([imagem], { type: "image/jpeg" }), `${post.id}.jpg`);
  // O Telegram limita a legenda da foto a 1024 caracteres
  form.append("caption", post.legenda.length > 1000 ? post.legenda.slice(0, 997) + "…" : post.legenda);
  form.append("reply_markup", JSON.stringify({
    inline_keyboard: [[
      { text: "✅ Aprovar e publicar", callback_data: `aprovar:${post.id}` },
      { text: "🔄 Gerar outro", callback_data: `outro:${post.id}` },
    ]],
  }));
  const res = await fetch(api("sendPhoto"), { method: "POST", body: form });
  const json = await res.json();
  if (!json.ok) throw new Error(`Telegram sendPhoto: ${json.description}`);
  return json.result.message_id;
}

export const mensagem = (chatId, texto) =>
  telegram("sendMessage", { chat_id: chatId, text: texto, disable_web_page_preview: true });

// Tira os botões de um rascunho que já foi decidido
export const removerBotoes = (chatId, messageId) =>
  telegram("editMessageReplyMarkup", { chat_id: chatId, message_id: messageId, reply_markup: { inline_keyboard: [] } }).catch(() => {});
