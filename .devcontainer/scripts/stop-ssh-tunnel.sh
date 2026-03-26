#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${1:-.devcontainer/tunnels.local.env}"
CONTROL_SOCKET="${HOME}/.ssh/go-devcontainer-tunnel.sock"

if [[ ! -f "${ENV_FILE}" ]]; then
	echo "Missing env file: ${ENV_FILE}"
	exit 1
fi

# shellcheck disable=SC1090
source "${ENV_FILE}"

if [[ -z "${SSH_HOST:-}" || -z "${SSH_USER:-}" || -z "${SSH_PORT:-}" ]]; then
	echo "SSH_HOST, SSH_USER and SSH_PORT are required in ${ENV_FILE}"
	exit 1
fi

set +e
ssh -S "${CONTROL_SOCKET}" -O exit -p "${SSH_PORT}" "${SSH_USER}@${SSH_HOST}"
status=$?
set -e

if [[ ${status} -eq 0 ]]; then
	echo "SSH tunnel stopped."
else
	echo "No active tunnel control socket found or tunnel already stopped."
fi
