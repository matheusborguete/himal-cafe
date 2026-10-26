// Gera o JPEG da arte do post SEM IA.
// O desenho em si está em public/assets/desenho.js, compartilhado com a
// prévia do painel /admin: o que você vê lá é o que vai para o Instagram.
import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { desenhar, LARGURA, ALTURA } from "../../public/assets/desenho.js";

const RAIZ = fileURLToPath(new URL("..", import.meta.url));

// Mesmas fontes do site (Google Fonts, licença OFL)
GlobalFonts.registerFromPath(join(RAIZ, "fontes", "Fraunces-Light.ttf"), "Fraunces");
GlobalFonts.registerFromPath(join(RAIZ, "fontes", "Inter-Regular.ttf"), "Inter");
GlobalFonts.registerFromPath(join(RAIZ, "fontes", "Inter-Medium.ttf"), "InterMedium");

const FONTES = {
  titulo: (px) => `${px}px Fraunces`,
  texto: (px) => `${px}px Inter`,
  destaque: (px) => `${px}px InterMedium`,
};

/**
 * @returns {Buffer} imagem JPEG (o Instagram só aceita JPEG pela API)
 */
export function desenharSlide({ etiqueta, titulo, texto, template, marca }) {
  const canvas = createCanvas(LARGURA, ALTURA);
  desenhar(canvas.getContext("2d"), { etiqueta, titulo, texto }, template, FONTES, marca);
  return canvas.toBuffer("image/jpeg", 92);
}
