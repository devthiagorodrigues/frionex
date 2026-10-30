# Frionex Transportes Refrigerados — site

Página única (HTML, CSS e um JavaScript pequeno, sem framework) com abertura, serviços, quem atendemos, cargas, área de atuação, contratação, cuidados, equipe e cotação. Inclui página de política de privacidade e 404.

**Projeto demonstrativo de portfólio.** Razão social, CNPJ, telefone, e-mail, endereço e horários são fictícios.

## Comandos

```bash
npm install          # sharp e fontes (Sora e Inter)
npm run imagens      # gera AVIF/WebP, logos, favicons e og-image a partir de ../01_Logos_e_Identidade e ../02_Imagens_e_Propostas
npm run build        # public/ de revisão (noindex)
npm run producao     # public/ publicável (exige "dominio" em site.config.json)
npm run preview      # build + servidor em http://127.0.0.1:4174
```

## Onde editar

- Dados da empresa: `site.config.json`
- Textos: `src/index.html`
- Cores e tipografia: variáveis no início de `src/css/styles.css`

Identidade: azul-marinho `#042B4B`, ciano `#2BB5EA`, cinza claro `#EFF4F7` e branco; Sora nos títulos e Inter no texto.
