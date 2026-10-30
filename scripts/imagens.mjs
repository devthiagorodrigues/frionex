// Gera as versões otimizadas (AVIF/WebP), logos, favicons e a imagem de compartilhamento.
// Os originais ficam intactos em ../01_Logos_e_Identidade e ../02_Imagens_e_Propostas. Uso: npm run imagens
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const material = path.resolve(raiz, '..');
const logos = path.join(material, '01_Logos_e_Identidade');
const fotos = path.join(material, '02_Imagens_e_Propostas');
const saida = path.join(raiz, 'src', 'img');
await mkdir(saida, { recursive: true });

const NAVY = '#042B4B';

async function gerar(entrada, nome, larguras, qualidade = 74) {
  const buf = await sharp(entrada).png().toBuffer();
  for (const w of larguras) {
    const r = () => sharp(buf).resize({ width: w, withoutEnlargement: true });
    await r().webp({ quality: qualidade, effort: 5 }).toFile(path.join(saida, `${nome}-${w}.webp`));
    await r().avif({ quality: Math.max(qualidade - 18, 40), effort: 4 }).toFile(path.join(saida, `${nome}-${w}.avif`));
  }
  console.log('ok', nome);
}

// ---------- fotos ----------
const W = [480, 800, 1200];
const fotosLista = {
  'hero-estrada': ['Caminhão refrigerado Frionex na rodovia.png', [800, 1200, 1600]],
  'estrada-por-do-sol': ['Caminhão refrigerado FRIONEX na estrada brasileira.png', W],
  'armazem': ['Armazém refrigerado com marca FRIONEX.png', W],
  'distribuicao': ['Caminhões Frionex no centro de distribuição.png', W],
  'carregamento': ['Carregamento refrigerado no cais da Frionex.png', W],
  'centro-logistico': ['Centro logístico refrigerado Frionex.png', W],
  'entrega-mercado': ['Entrega refrigerada Frionex em São Paulo.png', W],
  'entrega-cozinha': ['Entrega refrigerada com caminhão Frionex.png', W],
  'central': ['Equipe Frionex coordenando entregas refrigeradas.png', W],
  'equipe': ['Equipe Frionex diante do caminhão refrigerado(1).png', W],
  'tecnico-painel': ['Técnico Frionex verifica painel a -18 °C.png', W],
  'conferencia': ['Inspetor verifica carga junto ao caminhão Frionex.png', W],
};
for (const [nome, [arq, ws]] of Object.entries(fotosLista)) await gerar(path.join(fotos, arq), nome, ws);

// ---------- logos ----------
const simboloArq = path.join(logos, 'Símbolo circular Frionex em azul e ciano.png');
const horizontalArq = path.join(logos, 'Logotipo FRIONEX para transportes refrigerados.png');
const aparar = (p) => sharp(p).trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 8 });

// logo horizontal (azul-marinho, fundo transparente)
const horizontal = await aparar(horizontalArq).png().toBuffer();
for (const w of [240, 480, 720]) await sharp(horizontal).resize({ width: w }).webp({ quality: 92 }).toFile(path.join(saida, `logo-${w}.webp`));
await sharp(horizontal).resize({ width: 900 }).png().toFile(path.join(saida, 'logo.png'));

// versão branca: o azul-marinho vira branco e o ciano é mantido; a transparência não muda
async function versaoBranca(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const ciano = data[i + 1] > 110 && data[i + 2] > 150 && data[i] < 150;
    if (!ciano) { data[i] = 255; data[i + 1] = 255; data[i + 2] = 255; }
  }
  return sharp(data, { raw: info }).png().toBuffer();
}
const branca = await versaoBranca(horizontal);
for (const w of [240, 480, 720]) await sharp(branca).resize({ width: w }).webp({ quality: 92 }).toFile(path.join(saida, `logo-branco-${w}.webp`));

// símbolo
const simbolo = await aparar(simboloArq).png().toBuffer();
await sharp(simbolo).resize({ width: 600 }).png().toFile(path.join(saida, 'simbolo.png'));
const simboloBranco = await versaoBranca(simbolo);
await sharp(simboloBranco).resize({ width: 600 }).png().toFile(path.join(saida, 'simbolo-branco.png'));

// ---------- favicons (símbolo sobre fundo branco, cantos arredondados) ----------
const cantos = (t) => Buffer.from(`<svg width="${t}" height="${t}"><rect width="${t}" height="${t}" rx="${t * 0.22}"/></svg>`);
for (const [nome, t] of [['favicon-32', 32], ['favicon-192', 192], ['favicon-512', 512], ['apple-touch-icon', 180]]) {
  const s = Math.round(t * 0.68);
  const ico = await sharp(simbolo).resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  await sharp({ create: { width: t, height: t, channels: 4, background: '#ffffff' } })
    .composite([{ input: ico, gravity: 'center' }, { input: cantos(t), blend: 'dest-in' }])
    .png().toFile(path.join(saida, `${nome}.png`));
}

// ---------- imagem de compartilhamento 1200×630 ----------
const L = 1200, A = 630;
const logoOg = await sharp(branca).resize({ width: 520 }).png().toBuffer();
const mLogo = await sharp(logoOg).metadata();
const foto = await sharp(path.join(fotos, 'Caminhão refrigerado Frionex na rodovia.png')).resize(560, A, { fit: 'cover', position: 'centre' }).png().toBuffer();
const fundo = Buffer.from(`<svg width="${L}" height="${A}" xmlns="http://www.w3.org/2000/svg"><rect width="${L}" height="${A}" fill="${NAVY}"/>
  <text x="70" y="${A - 70}" font-family="Arial, sans-serif" font-size="30" fill="#ffffff">Transporte refrigerado com planejamento.</text></svg>`);
await sharp(fundo).composite([
  { input: foto, left: L - 560, top: 0 },
  { input: logoOg, left: 70, top: Math.round((A - mLogo.height) / 2) - 40 },
]).jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(saida, 'og-image.jpg'));
console.log('ok logos, favicons, og-image');
