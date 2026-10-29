// Publica no Instagram pela API do Instagram.
// Não precisa de Página do Facebook: só uma conta profissional e um token.
// A publicação tem 2 passos: (1) criar o "container" com a imagem, (2) publicar.
//
// Dois tipos de token, conforme a idade do app na Meta:
// - IGAA… (apps antigos, "API com login do Instagram"): usa graph.instagram.com
//   e descobre sozinho o id da conta.
// - EAA…  (apps novos, "login unificado"): usa graph.facebook.com e precisa do
//   id da conta do Instagram em IG_USER_ID (o número abaixo do @ no painel da Meta).
const TOKEN_UNIFICADO = (process.env.IG_TOKEN || "").startsWith("EAA");
const BASE = TOKEN_UNIFICADO ? "https://graph.facebook.com/v23.0" : "https://graph.instagram.com/v23.0";
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

async function chamar(metodo, caminho, params = {}) {
  const corpo = new URLSearchParams({ ...params, access_token: process.env.IG_TOKEN });
  const url = metodo === "GET" ? `${BASE}/${caminho}?${corpo}` : `${BASE}/${caminho}`;
  const res = await fetch(url, metodo === "GET" ? {} : { method: "POST", body: corpo });
  const json = await res.json();
  if (!res.ok || json.error) {
    const erro = new Error(`Instagram: ${json.error?.message || JSON.stringify(json)}`);
    erro.temporario = !!json.error?.is_transient || [2207027, 2207052, 2207003].includes(json.error?.error_subcode);
    throw erro;
  }
  return json;
}

// Tenta de novo quando o Instagram ainda está baixando/processando a imagem
async function comRepeticao(acao, tentativas = 8) {
  for (let i = 1; ; i++) {
    try {
      return await acao();
    } catch (e) {
      if (!e.temporario || i >= tentativas) throw e;
      await esperar(5000);
    }
  }
}

export async function minhaConta() {
  if (!TOKEN_UNIFICADO) return chamar("GET", "me", { fields: "user_id,username" });
  // Token do login unificado: o /me não traz a conta, então usamos o IG_USER_ID
  const id = process.env.IG_USER_ID;
  if (!id) throw new Error("Instagram: token EAA… (login unificado) precisa do IG_USER_ID no .env");
  const { username } = await chamar("GET", id, { fields: "username" });
  return { user_id: id, username };
}

/**
 * @param {string} imagemUrl  URL PÚBLICA de um JPEG (o Instagram baixa a imagem dali)
 * @param {string} legenda
 * @returns {{ id: string, permalink: string }}
 */
export async function publicarImagem(imagemUrl, legenda) {
  const { user_id } = await minhaConta();
  const container = await comRepeticao(() => chamar("POST", `${user_id}/media`, { image_url: imagemUrl, caption: legenda }));
  await esperar(3000);
  const publicado = await comRepeticao(() => chamar("POST", `${user_id}/media_publish`, { creation_id: container.id }));
  const { permalink } = await chamar("GET", publicado.id, { fields: "permalink" });
  return { id: publicado.id, permalink };
}
