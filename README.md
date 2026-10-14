# Portfólio — Matheus Brazolin

Site de portfólio pessoal em HTML, CSS e JavaScript puro, sem frameworks nem etapa de build.

**Acesse:** https://matheus-brazolin-portfolio.vercel.app

## O que tem

- Resumo rápido no topo (cargo atual, foco, stack, formação, idiomas) e currículo em PDF para download
- Experiência profissional com resultados e tecnologias de cada cargo
- Projetos como estudos de caso: problema, decisões técnicas, entrega e qualidade, com captura de tela, demo e código
- Stack agrupada por área, formação e contato com botão de copiar e-mail
- Tema claro/escuro (segue o sistema por padrão, sem piscar ao carregar)
- Layout responsivo, navegação por teclado, link "pular para o conteúdo" e respeito a `prefers-reduced-motion`
- Metadados Open Graph e dados estruturados (`schema.org/Person`)

## Rodando localmente

```bash
python3 -m http.server 8000
```

Depois abra `http://localhost:8000`.

## Estrutura

```
index.html                         conteúdo e metadados
style.css                          tokens de tema, layout e responsivo
script.js                          tema, menu mobile, animações e copiar e-mail
og-image.png                       imagem de prévia ao compartilhar o link
assets/curriculo-matheus-brazolin.pdf
assets/projects/                   capturas de tela dos projetos
```
