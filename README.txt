MARKETPLACE - GITHUB + NETLIFY BLOBS

Arquivos:
- index.html
- style.css
- script.js
- package.json
- netlify.toml
- netlify/functions/ads.mjs
- netlify/functions/image.mjs

COMO USAR
1. Crie um repositório no GitHub.
2. Envie todos estes arquivos mantendo a pasta netlify/functions.
3. No Netlify, conecte o repositório.
4. Não precisa criar Firebase ou Supabase.
5. Faça o deploy.
6. No Netlify, vá em Data & Storage > Blobs e crie/veja o store chamado "marketplace". A Function também usa esse store.

O site salva os anúncios e as imagens no Netlify Blobs. Os anúncios são compartilhados entre os visitantes.

OBSERVAÇÃO
Este é um MVP sem login, edição ou exclusão de anúncios. O contato é público no anúncio.
