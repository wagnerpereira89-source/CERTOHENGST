# Organização Pessoal — Painel / Demandas / Projetos

App pessoal (PWA) em React + Vite + Supabase.

## Variáveis de ambiente (Vercel → Settings → Environment Variables)
- `VITE_SUPABASE_URL` = URL do projeto Supabase (sem barra no final)
- `VITE_SUPABASE_ANON_KEY` = chave pública (anon / publishable)

## Rodar local (opcional)
```
npm install
npm run dev
```

## Deploy
A Vercel detecta Vite automaticamente. Suba no GitHub, importe na Vercel,
cole as 2 variáveis acima e faça o deploy.
