// "Banco de dados" do postador: arquivos JSON dentro do próprio repositório.
// Simples de ver e de explicar: cada post gerado vira um item em dados/posts.json.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

export const RAIZ = fileURLToPath(new URL("..", import.meta.url));
const caminho = (nome) => join(RAIZ, "dados", nome);

function ler(nome, padrao) {
  return existsSync(caminho(nome)) ? JSON.parse(readFileSync(caminho(nome), "utf8")) : padrao;
}
function gravar(nome, dados) {
  writeFileSync(caminho(nome), JSON.stringify(dados, null, 2) + "\n");
}

export const lerPosts = () => ler("posts.json", []);
export const gravarPosts = (posts) => gravar("posts.json", posts);

export function atualizarPost(id, mudancas) {
  const posts = lerPosts();
  const post = posts.find((p) => p.id === id);
  if (!post) throw new Error(`Post ${id} não encontrado`);
  Object.assign(post, mudancas);
  gravarPosts(posts);
  return post;
}

// Últimos temas usados, para a IA não repetir assunto
export const temasRecentes = (n = 20) => lerPosts().slice(-n).map((p) => p.tema);

// Posição de leitura das mensagens do Telegram (para não processar a mesma duas vezes)
export const lerOffset = () => ler("telegram.json", { offset: 0 }).offset;
export const gravarOffset = (offset) => gravar("telegram.json", { offset });

export const marca = () => JSON.parse(readFileSync(join(RAIZ, "marca.json"), "utf8"));
