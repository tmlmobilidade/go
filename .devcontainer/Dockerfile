FROM mcr.microsoft.com/devcontainers/typescript-node:22-bookworm

# Install team-required OS packages from a tracked file.
COPY .devcontainer/packages.required.txt /tmp/packages.required.txt
RUN apt-get update \
	&& xargs -r -a /tmp/packages.required.txt apt-get install -y --no-install-recommends \
	&& rm -rf /var/lib/apt/lists/* /tmp/packages.required.txt
