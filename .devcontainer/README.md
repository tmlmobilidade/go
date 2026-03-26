# Devcontainer workflow for GO

## What devcontainers are

A devcontainer is a reproducible development environment defined in source control.

For this repository, the devcontainer provides:
- A Node 22 + Debian environment with team-required Linux packages.
- Preconfigured VS Code extensions for this project.
- A repeatable setup flow (`postCreateCommand`) so onboarding is consistent.
- Optional local hooks and local secrets that stay out of git.

## Team-standard files (tracked)

- `.devcontainer/devcontainer.json`: the main VS Code devcontainer definition.
- `.devcontainer/Dockerfile`: image build and required package installation.
- `.devcontainer/packages.required.txt`: required apt packages installed on build.
- `.devcontainer/packages.recommended.txt`: optional apt packages for individual developers.
- `.devcontainer/scripts/post-create.sh`: standard post-create bootstrap.
- `.devcontainer/scripts/start-ssh-tunnel.sh`: starts SSH tunnels from env config.
- `.devcontainer/scripts/stop-ssh-tunnel.sh`: stops tunnel process.
- `.devcontainer/scripts/tunnel-status.sh`: checks tunnel status.
- `.devcontainer/tunnels.example.env`: template for tunnel configuration.

## Personal customization (not tracked)

These files are ignored by git:
- `.devcontainer/devcontainer.local.json`
- `.devcontainer/tunnels.local.env`
- `.devcontainer/scripts/post-create.local.sh`

Recommended usage:
1. Keep team defaults in tracked files.
2. Put personal secrets and custom commands in local ignored files.
3. Avoid changing tracked defaults unless the team agrees.

## First-time setup

1. Install Docker Desktop and VS Code extensions:
   - `ms-vscode-remote.remote-containers`
   - `ms-azuretools.vscode-containers`
2. Open the repository in VS Code.
3. Run: `Dev Containers: Reopen in Container`.
4. Wait for image build and `post-create` to complete.

## Optional recommended packages

Inside the devcontainer, run:

```bash
bash .devcontainer/scripts/install-recommended-packages.sh
```

## SSH tunnel workflow

1. Create your local tunnel config:

```bash
cp .devcontainer/tunnels.example.env .devcontainer/tunnels.local.env
```

2. Edit `.devcontainer/tunnels.local.env`:
- `SSH_HOST`, `SSH_USER`, `SSH_PORT`
- Optional `SSH_KEY_PATH`
- `TUNNELS` as `local:remoteHost:remotePort` entries

Example:

```dotenv
SSH_HOST=my-bastion.company.net
SSH_USER=ubuntu
SSH_PORT=22
SSH_KEY_PATH=/home/node/.ssh/id_ed25519
LOCAL_BIND_ADDRESS=127.0.0.1
TUNNELS=27017:127.0.0.1:27017,8123:127.0.0.1:8123,9000:127.0.0.1:9000
```

3. Start tunnel:

```bash
bash .devcontainer/scripts/start-ssh-tunnel.sh
```

4. Check status:

```bash
bash .devcontainer/scripts/tunnel-status.sh
```

5. Stop tunnel:

```bash
bash .devcontainer/scripts/stop-ssh-tunnel.sh
```

## Database access from tools

Use `127.0.0.1` plus the forwarded local port inside the devcontainer (for example `127.0.0.1:27017` for MongoDB).

This allows direct database connections from apps, scripts, and database clients running in the container.
