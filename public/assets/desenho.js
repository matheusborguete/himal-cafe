// Desenho da arte do post (1080x1350, formato 4:5 do Instagram).
// O MESMO código roda em dois lugares:
//   - no painel /admin, para mostrar a prévia ao editar um template;
//   - no postador (Node, GitHub Actions), para gerar o JPEG publicado.
// Por isso não importa nada: recebe o "ctx" de um canvas e as fontes.

export const LARGURA = 1080;
export const ALTURA = 1350;
const MARGEM = 96;

// Quebra o texto em linhas que cabem na largura
function quebrarLinhas(ctx, texto, larguraMax) {
  const linhas = [];
  let linha = "";
  for (const palavra of String(texto || "").split(/\s+/).filter(Boolean)) {
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

// Escreve com espaçamento entre letras (para "HIMAL" e a etiqueta)
function textoEspacado(ctx, texto, x, y, espaco) {
  for (const letra of texto) {
    ctx.fillText(letra, x, y);
    x += ctx.measureText(letra).width + espaco;
  }
}

/**
 * @param ctx       contexto 2D de um canvas 1080x1350
 * @param conteudo  { etiqueta, titulo, texto }
 * @param t         template: { fundo, faixa, montanhas:[2 cores], corEtiqueta, corTitulo, corTexto, corMarca }
 * @param fontes    { titulo(px), texto(px), destaque(px) } → string de fonte do canvas
 * @param assinatura { nome, site } que vão no rodapé da arte
 */
export function desenhar(ctx, conteudo, t, fontes, assinatura = {}) {
  const L = LARGURA, A = ALTURA;

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
  ctx.font = fontes.destaque(26);
  textoEspacado(ctx, String(conteudo.etiqueta || "Café do Nepal").toUpperCase(), MARGEM, 150, 5);

  // Título: diminui a fonte até caber em no máximo 5 linhas
  let tamanho = 96, linhas;
  do {
    ctx.font = fontes.titulo(tamanho);
    linhas = quebrarLinhas(ctx, conteudo.titulo, larguraTexto);
    tamanho -= 4;
  } while (linhas.length > 5 && tamanho >= 56);
  tamanho += 4;
  ctx.fillStyle = t.corTitulo;
  let y = 230;
  for (const linha of linhas) {
    ctx.fillText(linha, MARGEM, y);
    y += Math.round(tamanho * 1.12);
  }

  // Texto de apoio
  y += 36;
  ctx.fillStyle = t.corTexto;
  ctx.font = fontes.texto(38);
  for (const linha of quebrarLinhas(ctx, conteudo.texto, larguraTexto).slice(0, 5)) {
    ctx.fillText(linha, MARGEM, y);
    y += 56;
  }

  // Assinatura da marca
  ctx.fillStyle = t.corMarca;
  ctx.font = fontes.titulo(40);
  textoEspacado(ctx, String(assinatura.nome || "Himal").toUpperCase(), MARGEM, A - 150, 14);
  ctx.font = fontes.texto(24);
  ctx.fillStyle = t.corEtiqueta;
  ctx.fillText(String(assinatura.site || "").replace(/^https?:\/\//, "").replace(/\/$/, ""), MARGEM, A - 92);
}
