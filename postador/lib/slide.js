// Desenha a arte do post (1080x1350, formato 4:5 do Instagram) SEM IA.
// O visual vem de um template em /templates (cores da marca) e o texto vem do Gemini.
import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const RAIZ = fileURLToPath(new URL("..", import.meta.url));
// Mesmas fontes do site (Google Fonts, licença OFL)
GlobalFonts.registerFromPath(join(RAIZ, "fontes", "Fraunces-Light.ttf"), "Fraunces");
GlobalFonts.registerFromPath(join(RAIZ, "fontes", "Inter-Regular.ttf"), "Inter");
GlobalFonts.registerFromPath(join(RAIZ, "fontes", "Inter-Medium.ttf"), "InterMedium");

const L = 1080;
const A = 1350;
const MARGEM = 96;

// Lista os templates cadastrados (cada arquivo .json em /templates é um template)
export function listarTemplates() {
  return readdirSync(join(RAIZ, "templates"))
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => JSON.parse(readFileSync(join(RAIZ, "templates", f), "utf8")));
}

// Quebra o texto em linhas que cabem na largura
function quebrarLinhas(ctx, texto, larguraMax) {
  const linhas = [];
  let linha = "";
  for (const palavra of String(texto).split(/\s+/).filter(Boolean)) {
    const teste = linha ? `${linha} ${palavra}` : palavra;
    if (ctx.measureText(teste).width > larguraMax && linha) {
      linhas.push(linha);
      linha = palavra;
    } else {
      linha = teste;
    }
  }
  if (linha) linhas.push(linha);
  return linhas;
}

// Reduz a fonte do título até caber em no máximo 5 linhas
function ajustarTitulo(ctx, titulo, larguraMax) {
  for (let tamanho = 96; tamanho >= 56; tamanho -= 4) {
    ctx.font = `${tamanho}px Fraunces`;
    const linhas = quebrarLinhas(ctx, titulo, larguraMax);
    if (linhas.length <= 5) return { tamanho, linhas };
  }
  ctx.font = "56px Fraunces";
  return { tamanho: 56, linhas: quebrarLinhas(ctx, titulo, larguraMax) };
}

// Escreve com espaçamento entre letras (para "HIMAL" e a etiqueta)
function textoEspacado(ctx, texto, x, y, espaco) {
  for (const letra of texto) {
    ctx.fillText(letra, x, y);
    x += ctx.measureText(letra).width + espaco;
  }
}

/**
 * Gera o PNG/JPEG do post.
 * @param {object} p
 * @param {string} p.etiqueta  texto pequeno do topo (ex.: "ORIGEM")
 * @param {string} p.titulo    frase principal
 * @param {string} p.texto     apoio curto (1 a 2 frases)
 * @param {object} p.template  um dos objetos de listarTemplates()
 * @returns {Buffer} imagem JPEG (o Instagram só aceita JPEG pela API)
 */
export function desenharSlide({ etiqueta, titulo, texto, template }) {
  const t = template;
  const canvas = createCanvas(L, A);
  const ctx = canvas.getContext("2d");

  // Fundo + faixa no topo (como a embalagem)
  ctx.fillStyle = t.fundo;
  ctx.fillRect(0, 0, L, A);
  ctx.fillStyle = t.faixa;
  ctx.fillRect(0, 0, L, 18);

  // Montanhas no rodapé (mesmo desenho da ilustração do site)
  ctx.fillStyle = t.montanhas[0];
  ctx.beginPath();
  ctx.moveTo(0, 1130); ctx.lineTo(190, 960); ctx.lineTo(300, 1040); ctx.lineTo(460, 880);
  ctx.lineTo(670, 1080); ctx.lineTo(810, 980); ctx.lineTo(L, 1140); ctx.lineTo(L, A); ctx.lineTo(0, A);
  ctx.fill();
  ctx.fillStyle = t.montanhas[1];
  ctx.beginPath();
  ctx.moveTo(0, 1210); ctx.lineTo(240, 1100); ctx.lineTo(460, 1190); ctx.lineTo(700, 1080);
  ctx.lineTo(L, 1220); ctx.lineTo(L, A); ctx.lineTo(0, A);
  ctx.fill();

  ctx.textBaseline = "top";
  const larguraTexto = L - MARGEM * 2;

  // Etiqueta
  ctx.fillStyle = t.corEtiqueta;
  ctx.font = "26px InterMedium";
  textoEspacado(ctx, (etiqueta || "Himal · Café do Nepal").toUpperCase(), MARGEM, 150, 5);

  // Título
  const { tamanho, linhas } = ajustarTitulo(ctx, titulo, larguraTexto);
  ctx.fillStyle = t.corTitulo;
  ctx.font = `${tamanho}px Fraunces`;
  let y = 230;
  for (const linha of linhas) {
    ctx.fillText(linha, MARGEM, y);
    y += Math.round(tamanho * 1.12);
  }

  // Texto de apoio
  y += 36;
  ctx.fillStyle = t.corTexto;
  ctx.font = "38px Inter";
  for (const linha of quebrarLinhas(ctx, texto || "", larguraTexto).slice(0, 5)) {
    ctx.fillText(linha, MARGEM, y);
    y += 56;
  }

  // Assinatura da marca
  ctx.fillStyle = t.corMarca;
  ctx.font = "40px Fraunces";
  textoEspacado(ctx, "HIMAL", MARGEM, A - 150, 14);
  ctx.font = "24px Inter";
  ctx.fillStyle = t.corEtiqueta;
  ctx.fillText("himal-cafe.web.app", MARGEM, A - 92);

  return canvas.toBuffer("image/jpeg", 92);
}
