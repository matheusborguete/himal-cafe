// Gera uma arte de exemplo com cada template ativo, sem precisar de nenhuma chave.
// Uso: npm run slide   →  arquivos em ./amostras
import { mkdirSync, writeFileSync } from "node:fs";
import { desenharSlide } from "./lib/slide.js";
import { carregarMarca, carregarTemplates } from "./lib/config.js";

mkdirSync("amostras", { recursive: true });
const marca = await carregarMarca();

for (const template of await carregarTemplates()) {
  const jpg = desenharSlide({
    etiqueta: "Ritual · Nº 02 Gurans",
    titulo: "Moa na hora e a nota de morango aparece.",
    texto: "O aroma do café começa a se perder minutos depois da moagem. Grão inteiro até o último instante.",
    template,
    marca,
  });
  writeFileSync(`amostras/${template.nome}.jpg`, jpg);
  console.log(`amostras/${template.nome}.jpg`);
}
