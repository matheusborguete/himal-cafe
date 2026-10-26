// Marca e templates: o postador lê o que você configurou no painel /admin
// (salvo no Firestore). Se não achar nada lá, usa os arquivos locais
// marca.json e templates/*.json como padrão.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { RAIZ } from "./estado.js";

// ID do projeto Firebase: variável de ambiente ou o .firebaserc do repositório
const PROJETO = process.env.FIREBASE_PROJECT
  || JSON.parse(readFileSync(join(RAIZ, "..", ".firebaserc"), "utf8")).projects.default;
const FIRESTORE = `https://firestore.googleapis.com/v1/projects/${PROJETO}/databases/(default)/documents`;

// O Firestore devolve cada campo com o tipo junto ({stringValue: "..."}); aqui viram valores simples
function valor(v) {
  if ("stringValue" in v) return v.stringValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("arrayValue" in v) return (v.arrayValue.values || []).map(valor);
  if ("mapValue" in v) return campos(v.mapValue.fields || {});
  return null;
}
const campos = (f) => Object.fromEntries(Object.entries(f).map(([k, v]) => [k, valor(v)]));

async function lerFirestore(caminho) {
  try {
    const res = await fetch(`${FIRESTORE}/${caminho}`, { signal: AbortSignal.timeout(10000) });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

export async function carregarMarca() {
  const doc = await lerFirestore("config/marca");
  if (doc?.fields) return campos(doc.fields);
  return JSON.parse(readFileSync(join(RAIZ, "marca.json"), "utf8"));
}

export async function carregarTemplates() {
  const lista = await lerFirestore("templates?pageSize=50");
  let templates = (lista?.documents || []).map((d) => ({ nome: d.name.split("/").pop(), ...campos(d.fields) }));
  if (!templates.length) {
    templates = readdirSync(join(RAIZ, "templates"))
      .filter((f) => f.endsWith(".json"))
      .map((f) => JSON.parse(readFileSync(join(RAIZ, "templates", f), "utf8")));
  }
  templates = templates.filter((t) => t.ativo !== false).sort((a, b) => a.nome.localeCompare(b.nome));
  if (!templates.length) throw new Error("Nenhum template ativo. Ative pelo menos um no painel.");
  return templates;
}
