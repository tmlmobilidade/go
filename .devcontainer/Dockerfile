FROM mcr.microsoft.com/devcontainers/typescript-node:1-24-bookworm

RUN apt-get update \
	&& export DEBIAN_FRONTEND=noninteractive \
	&& apt-get install -y --no-install-recommends \
		bash-completion \
		ca-certificates \
		curl \
		g++ \
		git \
		jq \
		make \
		openssh-client \
		pkg-config \
		python3 \
	&& apt-get clean \
	&& rm -rf /var/lib/apt/lists/*
