// Salva imagens e estado no repositório (git commit + push).
// Assim a imagem ganha uma URL pública, que é o que o Instagram exige.
import { execSync } from "node:child_process";
import { RAIZ } from "./estado.js";

const git = (cmd) => execSync(`git ${cmd}`, { cwd: RAIZ, encoding: "utf8" }).trim();

export function salvarNoGitHub(mensagem) {
  if (git("status --porcelain dados imagens")) {
    git("add dados imagens");
    git(`commit -q -m "${mensagem.replace(/"/g, "'")}"`);
    git("pull -q --rebase --autostash");
    git("push -q");
  }
  return git("rev-parse HEAD");
}

// "dono/repositorio", lido do próprio git (funciona em qualquer cópia do projeto)
export function nomeDoRepositorio() {
  if (process.env.GITHUB_REPOSITORY) return process.env.GITHUB_REPOSITORY;
  return git("remote get-url origin").replace(/^.*github\.com[:/]/, "").replace(/\.git$/, "");
}

// URL pública da imagem via jsDelivr (CDN gratuito que serve arquivos do GitHub
// com o tipo certo, image/jpeg). Fixamos o commit para a URL nunca mudar.
export const urlPublica = (sha, arquivo) =>
  `https://cdn.jsdelivr.net/gh/${nomeDoRepositorio()}@${sha}/postador/${arquivo}`;
