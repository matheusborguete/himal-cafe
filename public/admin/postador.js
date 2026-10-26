// Aba "Postador do Instagram" do painel.
// Edita a marca e os templates da arte. Tudo fica salvo no Firestore
// (config/marca e templates/{nome}) e o postador no GitHub Actions lê de lá.
import { db } from "/assets/firebase.js";
import { desenhar, LARGURA, ALTURA } from "/assets/desenho.js";
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Repositório do postador (para importar os padrões e mostrar o histórico)
const REPO = "matheusborguete/himal-cafe";

const FONTES = {
  titulo: (px) => `300 ${px}px Fraunces`,
  texto: (px) => `400 ${px}px Inter`,
  destaque: (px) => `500 ${px}px Inter`,
};

const CORES = [
  ["fundo", "Fundo"],
  ["faixa", "Faixa do topo"],
  ["montanha1", "Montanha de trás"],
  ["montanha2", "Montanha da frente"],
  ["corEtiqueta", "Etiqueta e site"],
  ["corTitulo", "Título"],
  ["corTexto", "Texto de apoio"],
  ["corMarca", "Nome da marca"],
];

const CAMPOS_MARCA = [
  ["nome", "Nome da marca", "input"],
  ["site", "Site", "input"],
  ["descricao", "O que a marca vende", "textarea"],
  ["publico", "Público", "textarea"],
  ["tom", "Tom de voz", "input"],
  ["evitar", "Evitar", "input"],
  ["cta", "Chamada para ação (fim da legenda)", "input"],
  ["hashtags", "Hashtags", "input"],
  ["pilares", "Pilares de conteúdo (um por linha)", "lista"],
  ["buscasDeNoticias", "Buscas no Google News (uma por linha)", "lista"],
];

const EXEMPLO = {
  etiqueta: "Ritual · Nº 02 Gurans",
  titulo: "Moa na hora e a nota de morango aparece.",
  texto: "O aroma do café começa a se perder minutos depois da moagem.",
};

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const criarId = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

let raiz, marca = {}, templates = [], editando = null;

export async function iniciarPostador(elemento) {
  raiz = elemento;
  raiz.innerHTML = `
    <span class="eyebrow">Postador do Instagram</span>
    <h1>Marca e templates</h1>
    <p class="muted" style="margin-top:8px">O postador gera 1 post por dia, manda para o Telegram e publica quando você aprova.
      Aqui você define <strong>como a IA escreve</strong> (marca) e <strong>como a arte fica</strong> (templates).</p>

    <div class="caixa">
      <div class="topo-painel"><h2 style="font-size:28px">Templates da arte</h2>
        <button class="btn btn-line" id="tpl-novo" type="button">+ Novo template</button></div>
      <p class="dica">Os templates ativos se alternam: cada post novo usa o próximo da fila.</p>
      <div id="tpl-grade" class="grade-templates"></div>
    </div>

    <div class="caixa" id="tpl-editor" hidden></div>

    <form class="caixa" id="form-marca">
      <h2 style="font-size:28px">Marca</h2>
      <p class="dica">É o "briefing" que vai no prompt do Gemini a cada post.</p>
      ${CAMPOS_MARCA.map(([id, rotulo, tipo]) => `
        <label for="m-${id}">${rotulo}</label>
        ${tipo === "input" ? `<input id="m-${id}">` : `<textarea id="m-${id}" style="min-height:${tipo === "lista" ? 130 : 90}px"></textarea>`}`).join("")}
      <div class="acoes"><button class="btn" type="submit">Salvar marca</button><span id="msg-marca" class="msg"></span></div>
    </form>

    <div class="caixa">
      <h2 style="font-size:28px">Últimos posts gerados</h2>
      <p class="dica">Lido do repositório no GitHub (pode levar alguns minutos para atualizar).</p>
      <ul id="historico" class="lista-posts"><li class="muted">Carregando…</li></ul>
    </div>`;

  raiz.querySelector("#form-marca").addEventListener("submit", salvarMarca);
  raiz.querySelector("#tpl-novo").addEventListener("click", () => abrirEditor(novoTemplate()));

  // Fontes do site precisam estar carregadas antes de desenhar no canvas
  await Promise.all([FONTES.titulo(40), FONTES.texto(40), FONTES.destaque(40)].map((f) => document.fonts.load(f)));
  await Promise.all([carregarMarca(), carregarTemplates()]);
  carregarHistorico();
}

// ---------- marca ----------
async function carregarMarca() {
  const snap = await getDoc(doc(db, "config", "marca"));
  marca = snap.exists() ? snap.data() : {};
  for (const [id, , tipo] of CAMPOS_MARCA) {
    const v = marca[id] ?? "";
    raiz.querySelector(`#m-${id}`).value = tipo === "lista" ? [].concat(v).join("\n") : v;
  }
}

async function salvarMarca(e) {
  e.preventDefault();
  const msg = raiz.querySelector("#msg-marca");
  const dados = {};
  for (const [id, , tipo] of CAMPOS_MARCA) {
    const v = raiz.querySelector(`#m-${id}`).value.trim();
    dados[id] = tipo === "lista" ? v.split("\n").map((s) => s.trim()).filter(Boolean) : v;
  }
  try {
    await setDoc(doc(db, "config", "marca"), dados);
    marca = dados;
    msg.className = "msg ok"; msg.textContent = "Marca salva. O próximo post já usa essas informações.";
    desenharGrade();
  } catch (err) {
    msg.className = "msg erro"; msg.textContent = "Erro ao salvar: " + (err.code || err.message);
  }
}

// ---------- templates ----------
async function carregarTemplates() {
  const snap = await getDocs(collection(db, "templates"));
  templates = snap.docs.map((d) => ({ nome: d.id, ...d.data() })).sort((a, b) => a.nome.localeCompare(b.nome));
  desenharGrade();
}

function preview(canvas, template, conteudo = EXEMPLO) {
  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.scale(canvas.width / LARGURA, canvas.height / ALTURA);
  desenhar(ctx, conteudo, template, FONTES, marca);
  ctx.restore();
}

function desenharGrade() {
  const grade = raiz.querySelector("#tpl-grade");
  if (!templates.length) {
    grade.innerHTML = `<p class="muted">Nenhum template salvo ainda. Crie um novo ou
      <button class="link-btn" id="tpl-importar" type="button">importe os padrões do repositório</button>.</p>`;
    grade.querySelector("#tpl-importar").addEventListener("click", importarPadroes);
    return;
  }
  grade.innerHTML = "";
  for (const t of templates) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "tpl-card" + (t.ativo === false ? " inativo" : "");
    card.innerHTML = `<canvas width="216" height="270"></canvas>
      <span><strong>${esc(t.nome)}</strong> ${t.ativo === false ? "· inativo" : ""}</span>`;
    preview(card.querySelector("canvas"), t);
    card.addEventListener("click", () => abrirEditor({ ...t, montanhas: [...t.montanhas] }));
    grade.append(card);
  }
}

function novoTemplate() {
  const base = templates[0] || { fundo: "#F5F3EE", faixa: "#B8475A", montanhas: ["#E4DFD6", "#CFC9BD"], corEtiqueta: "#8C8A84", corTitulo: "#1E1E1C", corTexto: "#4A4A46", corMarca: "#B8475A" };
  return { ...base, montanhas: [...base.montanhas], nome: "", descricao: "", ativo: true, novo: true };
}

function abrirEditor(t) {
  editando = t;
  const ed = raiz.querySelector("#tpl-editor");
  ed.hidden = false;
  const valorCor = (id) => id === "montanha1" ? t.montanhas[0] : id === "montanha2" ? t.montanhas[1] : t[id];
  ed.innerHTML = `
    <div class="topo-painel"><h2 style="font-size:28px">${t.novo ? "Novo template" : `Editar “${esc(t.nome)}”`}</h2>
      <button class="link-btn" id="ed-fechar" type="button">Fechar</button></div>
    <div class="editor">
      <div>
        <label for="ed-nome">Nome</label>
        <input id="ed-nome" value="${esc(t.nome)}" ${t.novo ? "" : "disabled"} placeholder="ex.: hiun">
        <label for="ed-descricao">Descrição</label>
        <input id="ed-descricao" value="${esc(t.descricao)}">
        <label class="check"><input type="checkbox" id="ed-ativo" ${t.ativo === false ? "" : "checked"}> Ativo (entra na fila de posts)</label>
        <div class="cores">
          ${CORES.map(([id, rotulo]) => `
            <label class="cor"><input type="color" data-cor="${id}" value="${valorCor(id)}"><span>${rotulo}</span></label>`).join("")}
        </div>
        <label for="ed-titulo">Texto de exemplo da prévia</label>
        <input id="ed-titulo" value="${esc(EXEMPLO.titulo)}">
        <div class="acoes">
          <button class="btn" id="ed-salvar" type="button">Salvar template</button>
          ${t.novo ? "" : `<button class="btn btn-line" id="ed-duplicar" type="button">Duplicar</button>
          <button class="link-btn perigo" id="ed-excluir" type="button">Excluir</button>`}
          <span id="msg-tpl" class="msg"></span>
        </div>
      </div>
      <div><canvas id="ed-preview" width="432" height="540"></canvas><p class="dica">Prévia real: o postador usa o mesmo desenho.</p></div>
    </div>`;

  const atualizar = () => {
    ed.querySelectorAll("[data-cor]").forEach((inp) => {
      const id = inp.dataset.cor;
      if (id === "montanha1") editando.montanhas[0] = inp.value;
      else if (id === "montanha2") editando.montanhas[1] = inp.value;
      else editando[id] = inp.value;
    });
    preview(ed.querySelector("#ed-preview"), editando, { ...EXEMPLO, titulo: ed.querySelector("#ed-titulo").value });
  };
  ed.oninput = atualizar;
  atualizar();

  ed.querySelector("#ed-fechar").onclick = () => { ed.hidden = true; };
  ed.querySelector("#ed-salvar").onclick = salvarTemplate;
  if (!t.novo) {
    ed.querySelector("#ed-duplicar").onclick = () => abrirEditor({ ...editando, montanhas: [...editando.montanhas], nome: "", novo: true });
    ed.querySelector("#ed-excluir").onclick = excluirTemplate;
  }
  ed.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function salvarTemplate() {
  const ed = raiz.querySelector("#tpl-editor");
  const msg = ed.querySelector("#msg-tpl");
  const id = editando.novo ? criarId(ed.querySelector("#ed-nome").value) : editando.nome;
  if (!id) { msg.className = "msg erro"; msg.textContent = "Dê um nome ao template."; return; }
  if (editando.novo && templates.some((t) => t.nome === id)) { msg.className = "msg erro"; msg.textContent = "Já existe um template com esse nome."; return; }

  const { nome, novo, ...cores } = editando;
  const dados = { ...cores, descricao: ed.querySelector("#ed-descricao").value.trim(), ativo: ed.querySelector("#ed-ativo").checked };
  try {
    await setDoc(doc(db, "templates", id), dados);
    await carregarTemplates();
    abrirEditor({ nome: id, ...dados, montanhas: [...dados.montanhas] });
    const m = raiz.querySelector("#msg-tpl");
    m.className = "msg ok"; m.textContent = "Template salvo.";
  } catch (err) {
    msg.className = "msg erro"; msg.textContent = "Erro ao salvar: " + (err.code || err.message);
  }
}

async function excluirTemplate() {
  if (!confirm(`Excluir o template "${editando.nome}"?`)) return;
  await deleteDoc(doc(db, "templates", editando.nome));
  raiz.querySelector("#tpl-editor").hidden = true;
  await carregarTemplates();
}

// Copia marca.json e templates/*.json do repositório para o Firestore (primeiro uso)
async function importarPadroes() {
  const raw = (caminho) => fetch(`https://raw.githubusercontent.com/${REPO}/main/postador/${caminho}`).then((r) => r.json());
  const arquivos = await fetch(`https://api.github.com/repos/${REPO}/contents/postador/templates`).then((r) => r.json());
  for (const arq of arquivos.filter((a) => a.name.endsWith(".json"))) {
    const { nome, ...t } = await raw(`templates/${arq.name}`);
    await setDoc(doc(db, "templates", nome), { ...t, ativo: true });
  }
  if (!marca.nome) await setDoc(doc(db, "config", "marca"), await raw("marca.json"));
  await Promise.all([carregarMarca(), carregarTemplates()]);
}

// ---------- histórico ----------
async function carregarHistorico() {
  const ul = raiz.querySelector("#historico");
  const ROTULO = { aguardando: "⏳ aguardando aprovação", publicado: "✅ publicado", descartado: "🔄 descartado", erro: "⚠️ erro" };
  try {
    const posts = await fetch(`https://raw.githubusercontent.com/${REPO}/main/postador/dados/posts.json?t=${Date.now()}`).then((r) => r.json());
    if (!posts.length) { ul.innerHTML = '<li class="muted">Nenhum post gerado ainda. No Telegram, mande /gerar para o bot.</li>'; return; }
    ul.innerHTML = posts.slice(-15).reverse().map((p) => `
      <li><span>${esc(p.tema)}<br><small class="muted">${new Date(p.criadoEm).toLocaleString("pt-BR")} · ${esc(p.template)}</small></span>
      <span>${p.permalink ? `<a href="${esc(p.permalink)}" target="_blank">${ROTULO[p.status]} ↗</a>` : ROTULO[p.status] || esc(p.status)}</span></li>`).join("");
  } catch {
    ul.innerHTML = '<li class="muted">Não foi possível ler o histórico agora.</li>';
  }
}
