# # #

FROM nginx:alpine-slim

ARG MODULE

WORKDIR /app

# # #
# Copy the config files

COPY ./modules/${MODULE}/apps/nginx/configs/. /etc/nginx/.

COPY ./.github/templates/nginx/error.html /etc/nginx/error.html


# # #
# Run Nginx	with auto-reload every 6 hours

CMD ["/bin/sh", "-c", "while :; do sleep 6h & wait ${!}; nginx -s reload; done & nginx -g 'daemon off;'"]
