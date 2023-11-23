FROM gitlab.wogra.com:443/developer/dependency_proxy/containers/nginxinc/nginx-unprivileged:stable-alpine-slim

COPY --chown=101:1 nginx/ /etc/nginx/conf.d/
COPY --chown=101:1 dist/webnet-builder-frontend/ /usr/share/nginx/html/
