#!/usr/bin/env bash

# -----------------------------------------------------------------------
# os-tuning.sh
# Packer provisioner: applies OS-level performance and firewall tuning.
# MongoDB-optimized kernel settings.
# -----------------------------------------------------------------------

set -euo pipefail

# 1.
# Wait for cloud-init to finish before applying any tuning,
# to avoid conflicts with cloud-init's own tuning steps.

echo "[tuning] Waiting for cloud-init to finish (this may take 1-2 minutes)..."
cloud-init status --wait
sleep 30
echo "[tuning] cloud-init finished."


# 2.
# Open MongoDB's default port `27017` in the firewall to allow external connections
# from within the private subnet. This is necessary for the MongoDB cluster
# to function properly, as the nodes need to communicate with each other
# and with clients. The firewall appears block incoming connections by default,
# so we need to explicitly allow it.

echo "[tuning] Clearing restrictive iptables rules..."
sudo iptables -I INPUT 1 -p tcp --dport 27017 -j ACCEPT
echo "[tuning] iptables rules cleared."


# 3.
# Apply MongoDB-recommended kernel settings.

echo "[tuning] Applying sysctl settings..."
cat >> /etc/sysctl.d/99-mongodb.conf <<'EOF'
# MongoDB recommended kernel settings
fs.file-max = 2097152
vm.swappiness = 1
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
EOF
sysctl -p /etc/sysctl.d/99-mongodb.conf
echo "[tuning] sysctl settings applied."


echo "[tuning] OS tuning complete."