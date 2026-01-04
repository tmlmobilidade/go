#!/usr/bin/env bash


###
# INSTALL COMMON BINARIES
# Update package index and install dependencies
apt-get update
apt-get install -y curl unzip jq


###
# INSTALL CONSUL

CONSUL_VERSION="1.22.2"

echo "Installing Consul version $CONSUL_VERSION"

# Create user and directories
useradd --system --home /etc/consul --shell /bin/false consul || true
mkdir -p /etc/consul.d /opt/consul/data
chown -R consul:consul /etc/consul.d /opt/consul

# Download and install
curl -fsSL https://releases.hashicorp.com/consul/${CONSUL_VERSION}/consul_${CONSUL_VERSION}_linux_amd64.zip -o /tmp/consul.zip
unzip -o /tmp/consul.zip -d /usr/local/bin
chmod +x /usr/local/bin/consul


###
# INSTALL NOMAD

NOMAD_VERSION="1.11.1"

echo "Installing Nomad version $NOMAD_VERSION"

# Create user and directories
useradd --system --home /etc/nomad --shell /bin/false nomad || true
mkdir -p /etc/nomad.d /opt/nomad/data
chown -R nomad:nomad /etc/nomad.d /opt/nomad

# Download and install
curl -fsSL https://releases.hashicorp.com/nomad/${NOMAD_VERSION}/nomad_${NOMAD_VERSION}_linux_amd64.zip -o /tmp/nomad.zip
unzip -o /tmp/nomad.zip -d /usr/local/bin
chmod +x /usr/local/bin/nomad


# # #
# RELOAD SYSTEMD

# Reload systemd units
systemctl daemon-reexec
systemctl daemon-reload

# Enable services to start on boot
systemctl enable consul
systemctl enable nomad

# Start services
systemctl start consul
systemctl start nomad

echo "Installation complete. Please configure systemd units and HCL configs."