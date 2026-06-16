# Miloševac frontend deployment

Frontend repozitorij: `aaleksandraa/milosevac-frontend`  
Backend repozitorij: `aaleksandraa/milosevac-backend`

## Arhitektura (produkcija)

```text
https://milosevac.com          → React build (frontend/dist)
https://api.milosevac.com      → Laravel backend (public/)
```

Frontend zove API direktno na `https://api.milosevac.com/api/...`.  
Slike se učitavaju sa `https://api.milosevac.com/storage/...`.

## Frontend (milosevac.com)

Plesk document root:

```text
/var/www/vhosts/milosevac.com/httpdocs/dist
```

ili, ako je cijeli repo u httpdocs:

```text
/var/www/vhosts/milosevac.com/httpdocs/frontend/dist
```

`.htaccess` u dist folderu (SPA fallback — već u `public/.htaccess`, kopira se pri buildu):

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
```

Build na serveru:

```bash
cd /var/www/vhosts/milosevac.com/httpdocs
npm ci
VITE_BACKEND_PUBLIC_URL=https://api.milosevac.com npm run build
```

Deploy skripta:

```bash
sudo install -o milosevac -g www-data -m 0755 deploy/server/deploy-frontend.sh /var/www/vhosts/milosevac.com/deploy-frontend.sh
sudo -u milosevac /var/www/vhosts/milosevac.com/deploy-frontend.sh main
```

## Backend (api.milosevac.com)

Plesk document root:

```text
/var/www/vhosts/api.milosevac.com/httpdocs/public
```

`.env` minimum:

```env
APP_URL=https://api.milosevac.com
FRONTEND_URL=https://milosevac.com
```

Nakon deploya:

```bash
cd /var/www/vhosts/api.milosevac.com/httpdocs
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan storage:link
php artisan content:transfer-sqlite shared/import/database.sqlite --truncate --force
php artisan cache:clear
```

Slike:

```text
storage/app/public/wordpress/2026/05/
storage/app/public/wordpress/2026/06/
```

## CORS (backend)

Frontend je na drugom domenu — backend mora dozvoliti `https://milosevac.com`.

U `milosevac-backend` dodaj `config/cors.php` (ako ne postoji) i u `.env`:

```env
FRONTEND_URL=https://milosevac.com
```

U `bootstrap/app.php` osiguraj da API middleware uključuje CORS (Laravel 12: `HandleCors` je default za `api/*`).

Test:

```bash
curl -s https://api.milosevac.com/up
curl -s 'https://api.milosevac.com/api/content?limit=1' | head -c 200
curl -I 'https://api.milosevac.com/storage/wordpress/2026/06/NEKO-IME.webp'
```

## GitHub Actions

Secrets: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `DEPLOY_KNOWN_HOSTS`  
Variable: `DEPLOY_ENABLED=true`

Build koristi `VITE_BACKEND_PUBLIC_URL=https://api.milosevac.com`.

Detaljnije backend korake vidi u repozitoriju `milosevac-backend` → `deploy/README.md`.
