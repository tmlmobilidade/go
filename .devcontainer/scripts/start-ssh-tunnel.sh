#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${1:-.devcontainer/tunnels.local.env}"
CONTROL_SOCKET="${HOME}/.ssh/go-devcontainer-tunnel.sock"

if [[ ! -f "${ENV_FILE}" ]]; then
	echo "Missing env file: ${ENV_FILE}"
	echo "Copy .devcontainer/tunnels.example.env to .devcontainer/tunnels.local.env and fill it."
	exit 1
fi

# shellcheck disable=SC1090
source "${ENV_FILE}"

required_vars=(SSH_HOST SSH_USER SSH_PORT LOCAL_BIND_ADDRESS TUNNELS)
for name in "${required_vars[@]}"; do
	if [[ -z "${!name:-}" ]]; then
		echo "Missing required variable: ${name}"
		exit 1
	fi
done

ssh_args=(
	-p "${SSH_PORT}"
	-o ExitOnForwardFailure=yes
	-o ServerAliveInterval=30
	-o ServerAliveCountMax=3
	-o ControlMaster=yes
	-o ControlPath="${CONTROL_SOCKET}"
	-o ControlPersist=10m
)

if [[ -n "${SSH_KEY_PATH:-}" ]]; then
	ssh_args+=( -i "${SSH_KEY_PATH}" )
fi

IFS=',' read -r -a tunnel_list <<< "${TUNNELS}"
for mapping in "${tunnel_list[@]}"; do
	local_port="${mapping%%:*}"
	tmp="${mapping#*:}"
	remote_host="${tmp%%:*}"
	remote_port="${tmp##*:}"

	if [[ -z "${local_port}" || -z "${remote_host}" || -z "${remote_port}" ]]; then
		echo "Invalid mapping '${mapping}'. Expected local:remoteHost:remotePort"
		exit 1
	fi

	ssh_args+=( -L "${LOCAL_BIND_ADDRESS}:${local_port}:${remote_host}:${remote_port}" )
done

ssh "${ssh_args[@]}" -fNT "${SSH_USER}@${SSH_HOST}"

echo "SSH tunnel started using ${ENV_FILE}"
echo "Control socket: ${CONTROL_SOCKET}"
