// Conexão com o Firebase (projeto himal-cafe).
// Esta configuração é pública por natureza: quem protege os dados são as
// regras do Firestore (firestore.rules), não esta chave.
// Para usar em outro projeto, troque pelos dados de:
//   firebase apps:sdkconfig WEB --project SEU-PROJETO
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCDAnhH_hh7e8bnlbsHTrlE3tjO8EmBW8E",
  authDomain: "himal-cafe.firebaseapp.com",
  projectId: "himal-cafe",
  appId: "1:921145946062:web:6679cce6c8d9e9706e459f",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Transforma o texto do post em HTML seguro.
// Aceita um markdown simples: parágrafos, "## Subtítulo", "- item" e **negrito**.
export function textoParaHtml(texto) {
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  return texto
    .replace(/\r/g, "")
    .split(/\n\s*\n/)
    .map((bloco) => {
      const linhas = bloco.trim().split("\n");
      if (!linhas[0]) return "";
      if (linhas[0].startsWith("### ")) return `<h3>${inline(linhas[0].slice(4))}</h3>`;
      if (linhas[0].startsWith("## ")) return `<h2>${inline(linhas[0].slice(3))}</h2>`;
      if (linhas.every((l) => /^[-*] /.test(l))) {
        return "<ul>" + linhas.map((l) => `<li>${inline(l.slice(2))}</li>`).join("") + "</ul>";
      }
      return `<p>${linhas.map(inline).join("<br>")}</p>`;
    })
    .join("\n");
}

export function formatarData(ts) {
  if (!ts) return "";
  return ts.toDate().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}
