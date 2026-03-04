#!/usr/bin/env bash
# -----------------------------------------------------------------------
# os-tuning.sh
# Packer provisioner: applies OS-level performance and firewall tuning.
# MongoDB-optimized kernel settings.
# -----------------------------------------------------------------------
set -euo pipefail

# -----------------------------------------------------------------------
# STEP 0: Wait for cloud-init to finish.
#
# On Ubuntu, first boot triggers cloud-init which runs apt-get update
# and installs packages. We MUST wait for it to complete before touching
# apt ourselves. This is the canonical solution — no killing processes,
# no deleting lock files, no race conditions.
# -----------------------------------------------------------------------
echo "[tuning] Waiting for cloud-init to finish (this may take 1–2 minutes)..."
cloud-init status --wait
echo "[tuning] cloud-init finished."

echo "[tuning] Installing required packages..."
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get install -y \
  xfsprogs \
  iptables-persistent

echo "[tuning] Disabling Transparent Huge Pages (THP)..."
# MongoDB explicitly requires THP to be disabled
cat > /etc/rc.local <<'EOF'
#!/bin/bash
echo 'never' > /sys/kernel/mm/transparent_hugepage/enabled
echo 'never' > /sys/kernel/mm/transparent_hugepage/defrag
exit 0
EOF
chmod +x /etc/rc.local
systemctl enable rc-local

echo 'never' > /sys/kernel/mm/transparent_hugepage/enabled
echo 'never' > /sys/kernel/mm/transparent_hugepage/defrag

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

echo "[tuning] OS tuning complete."
