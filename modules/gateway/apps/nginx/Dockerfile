# # #

FROM nginx:alpine-slim


# # #
# ENVIRONMENT ARGUMENTS

ARG ENVIRONMENT
RUN if [ -z "$ENVIRONMENT" ]; then echo "ENVIRONMENT is not set" && exit 1; fi

ARG NGINX_SERVER_NAME
RUN if [ -z "$NGINX_SERVER_NAME" ]; then echo "NGINX_SERVER_NAME is not set" && exit 1; fi


# # #
# APPLICATION SETUP

WORKDIR /app


# # #
# Install envsubst for variable substitution

RUN apk add --no-cache gettext


# # #
# BUILD NGINX CONFIGURATION FILE

COPY ./modules/gateway/apps/nginx/configs/nginx.conf /etc/nginx/nginx.conf.template
COPY ./modules/gateway/apps/nginx/configs/upstreams.${ENVIRONMENT}.conf /etc/nginx/upstreams.conf

RUN envsubst '${NGINX_SERVER_NAME}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf


# # #
# SETUP CUSTOM ERROR PAGES

COPY ./.github/templates/nginx/error.html /var/www/html/error.html


# # #
# RUN NGINX WITH AUTO RELOAD

CMD ["/bin/sh", "-c", "while :; do sleep 6h & wait ${!}; nginx -s reload; done & nginx -g 'daemon off;'"]
