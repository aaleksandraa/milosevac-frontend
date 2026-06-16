# Miloševac frontend

React/Vite javni portal za `https://milosevac.com`.

Laravel CMS i API: `https://api.milosevac.com`  
Repozitorij: `aaleksandraa/milosevac-backend`

## Lokalni razvoj

```bash
npm install
cp .env.example .env
npm run dev
```

Backend kloniraj u ignorisani `backend/` folder i pokreni:

```bash
cd backend && php artisan serve --port=8002
```

Varijable (`.env.example`):

- `VITE_BACKEND_URL` — lokalni Laravel (Vite proxy za `/api` u dev modu)
- `VITE_BACKEND_PUBLIC_URL` — produkcijski API host (`https://api.milosevac.com`)
- `VITE_BACKEND_STORAGE_PATH` — lokalna putanja do Laravel storagea (dev slike)

U dev modu frontend zove `/api/...` kroz Vite proxy; u produkciji direktno
`https://api.milosevac.com/api/...`.

## Produkcija

- **milosevac.com** — samo React `dist/`
- **api.milosevac.com** — Laravel `public/`

Uputstvo: [`deploy/README.md`](deploy/README.md)
