# Achilles Media

Site institucional da **Achilles Media** — posicionamento digital, branding e automações com IA para empresas.

🔗 **Ao vivo:** [achillesmedia.com.br](https://achillesmedia.com.br)

> Sites profissionais, landing pages de conversão, SEO, identidade visual e automações com IA para empresas que querem aparecer melhor, converter mais e operar com menos esforço manual.

---

## ✨ Sobre o projeto

Site multipágina, estático e responsivo, construído com **HTML, CSS e JavaScript puros** — sem frameworks e sem etapa de build. O foco é performance, carregamento rápido e uma experiência limpa em qualquer dispositivo.

Destaques técnicos:

- **Zero dependências** — nada de bundlers, npm ou build; é só abrir e servir.
- **Animações leves** com `IntersectionObserver` (reveal ao rolar, contadores animados) e respeito a `prefers-reduced-motion`.
- **Logo em `<canvas>`** desenhada a partir de dados vetoriais (`assets/hero-logo-data.js`), com fallback para não ficar invisível.
- **SEO e social** — meta tags, Open Graph, `robots.txt` e `sitemap.xml`.
- **Acessibilidade** — navegação por teclado, `aria-label`s e contraste cuidado.

## 📄 Páginas

| Página            | Arquivo            | Conteúdo                                            |
| ----------------- | ------------------ | -------------------------------------------------- |
| Início            | `index.html`       | Home, apresentação, pilares e provas               |
| Soluções          | `solucoes.html`    | Presença digital, IA aplicada, automação e dados   |
| Como funciona     | `processo.html`    | Etapas do processo de trabalho                      |
| Resultados        | `resultados.html`  | Cases e resultados                                  |
| Contato           | `contato.html`     | Formas de contato e localização                     |

## 🗂 Estrutura

```
.
├── index.html            # Home
├── solucoes.html
├── processo.html
├── resultados.html
├── contato.html
├── styles.css            # Estilos globais
├── app.js                # Interações (menu, animações, contadores, canvas)
├── robots.txt
├── sitemap.xml
└── assets/
    ├── hero-logo-data.js # Dados vetoriais da logo (canvas)
    ├── logo-achilles.png
    ├── logo-achilles-preto.png
    ├── logo-achilles-branca.png
    └── logo-nome-trim.png
```

## 🚀 Rodando localmente

Por ser estático, basta um servidor HTTP simples (abrir o `index.html` direto no navegador funciona, mas um servidor evita restrições de caminho):

```bash
# Python 3
python -m http.server 8000

# ou Node
npx serve
```

Depois acesse `http://localhost:8000`.

## 🌐 Deploy

Publicação contínua: cada `push` na branch `main` dispara o deploy automático.

```
GitHub (main)  →  Netlify (build/deploy automático)  →  Cloudflare  →  achillesmedia.com.br
```

- **Publish directory:** raiz do repositório (os `.html` ficam na raiz).
- Nenhum comando de build é necessário.

## 🛠 Tecnologias

- HTML5 semântico
- CSS3 (custom properties, grid, flexbox)
- JavaScript (vanilla, ES5-compatível)
- Netlify · Cloudflare

## 👤 Autor

**Arthur Xavier** — [Achilles Media](https://achillesmedia.com.br)

## 📄 Licença

© Achilles Media. Todos os direitos reservados. Código disponibilizado publicamente para fins de portfólio.
