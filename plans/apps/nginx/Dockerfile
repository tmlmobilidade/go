# # #

FROM nginx:alpine-slim

WORKDIR /app

# Install envsubst for variable substitution
RUN apk add --no-cache gettext

# Copy the template
COPY ./configs/nginx.conf /etc/nginx/nginx.conf.template

# Render the template at build time
ARG NGINX_SERVER_NAME
ENV NGINX_SERVER_NAME=${NGINX_SERVER_NAME}
RUN envsubst < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# # #
# Setup Nginx configuration

COPY ./configs /etc/nginx/


# # #
# Run Nginx	with auto-reload every 6 hours

CMD ["/bin/sh", "-c", "while :; do sleep 6h & wait ${!}; nginx -s reload; done & nginx -g 'daemon off;'"]
