# Miloševac frontend

React/Vite javni portal za `https://milosevac.com`.

Laravel CMS i API održavaju se u zasebnom repozitoriju
`aaleksandraa/milosevac-backend`. U lokalnom razvoju backend može biti kloniran
u ignorisani `backend/` direktorij, pa Vite može posluživati uploadovane slike.

## Lokalni razvoj

```bash
npm install
npm run dev
npm run lint
npm test
npm run build
```

Varijable iz `.env.example`:

- `VITE_BACKEND_URL` je lokalni API koji Vite prosljeđuje kroz `/api`.
- `VITE_BACKEND_PUBLIC_URL` se koristi za backend/admin linkove.
- `VITE_BACKEND_STORAGE_PATH` je lokalna putanja do Laravel public storagea.

Frontend sadrži fallback snapshot u `src/data/portal-content.snapshot.json`, ali
se aktuelni sadržaj učitava preko `/api`.

## Produkcija

Repozitorij se klonira u `/var/www/milosevac.com/frontend`, a Nginx servira
`/var/www/milosevac.com/frontend/dist`. Laravel repo je direktno u rootu domena.
Uputstvo i frontend deploy skripta su u
[`deploy/README.md`](deploy/README.md).
