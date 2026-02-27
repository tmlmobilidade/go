# # #
# GATEWAY MODULE — PoC Dockerfile
#
# Adapted from modules/gateway/apps/nginx/Dockerfile for Kubernetes PoC.
# Key simplifications vs. the production Dockerfile:
#   - No required build ARGs (ENVIRONMENT, NGINX_SERVER_NAME) — self-contained.
#   - All COPY paths are local to this directory (no monorepo root dependency).
#   - TLS is terminated at the ingress / OCI Load Balancer layer in Kubernetes,
#     so this image serves HTTP-only on port 80.
#
# Build:
#   docker build -t gateway-poc:local .
#
# Run locally:
#   docker run -p 8080:80 gateway-poc:local
#   curl http://localhost:8080/health


FROM nginx:alpine-slim


# # #
# APPLICATION SETUP

WORKDIR /app


# # #
# COPY NGINX CONFIGURATION

COPY ./configs/nginx.conf /etc/nginx/nginx.conf


# # #
# EXPOSE PORT

EXPOSE 80


# # #
# RUN NGINX

CMD ["nginx", "-g", "daemon off;"]
