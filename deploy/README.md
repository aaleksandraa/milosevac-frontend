# Miloševac frontend deployment

Frontend je zaseban Git repozitorij `aaleksandraa/milosevac-frontend`.

Laravel backend je instaliran direktno u root domena `/var/www/milosevac.com`.
Frontend se klonira u `/var/www/milosevac.com/frontend`, a Nginx servira njegov
`dist/` direktorij na `https://milosevac.com`.

## Prvi deployment

```bash
sudo -u milosevac git clone git@github.com:aaleksandraa/milosevac-frontend.git /var/www/milosevac.com/frontend
sudo install -o milosevac -g www-data -m 0755 \
  /var/www/milosevac.com/frontend/deploy/server/deploy-frontend.sh \
  /var/www/milosevac.com/deploy-frontend.sh
sudo -u milosevac /var/www/milosevac.com/deploy-frontend.sh main
```

GitHub Actions koristi repository variable `DEPLOY_ENABLED=true` i secrets:
`DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `DEPLOY_KNOWN_HOSTS`.

Kompletna Nginx, PHP-FPM, MySQL, backup i backend dokumentacija nalazi se u
repozitoriju `milosevac-backend`.
