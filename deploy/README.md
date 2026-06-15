# Miloševac frontend deployment

Frontend je zaseban Git repozitorij `aaleksandraa/milosevac-frontend`.

Na serveru se klonira u `/var/www/milosevac.com/httpdocs`, a Nginx servira
njegov `dist/` direktorij. Laravel backend je zaseban repozitorij u
`/var/www/milosevac.com/backend`.

## Prvi deployment

```bash
sudo install -d -o milosevac -g www-data -m 2775 /var/www/milosevac.com
sudo -u milosevac git clone git@github.com:aaleksandraa/milosevac-frontend.git /var/www/milosevac.com/httpdocs
sudo install -o milosevac -g www-data -m 0755 \
  /var/www/milosevac.com/httpdocs/deploy/server/deploy-frontend.sh \
  /var/www/milosevac.com/deploy-frontend.sh
sudo -u milosevac /var/www/milosevac.com/deploy-frontend.sh main
```

GitHub Actions koristi repository variable `DEPLOY_ENABLED=true` i secrets:
`DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `DEPLOY_KNOWN_HOSTS`.

Kompletna Nginx, PHP-FPM, MySQL, backup i backend dokumentacija nalazi se u
repozitoriju `milosevac-backend`.
