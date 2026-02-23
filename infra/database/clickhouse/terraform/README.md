# ClickHouse — Terraform (OCI)

This directory contains a **self-contained** Terraform root that provisions an isolated
ClickHouse database server on Oracle Cloud Infrastructure (OCI).

It creates its own VCN, subnet, internet gateway, route table, security list and a
`VM.Standard.A1.Flex` compute instance (ARM, Always-Free eligible). ClickHouse is
started automatically on first boot via Docker Compose through cloud-init.

> **This module does not share any resources with the existing compute infrastructure.**

---

## Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/install) installed
- OCI account with API key credentials (tenancy OCID, user OCID, fingerprint, private key)
- An SSH key pair (public key path configured in `terraform.tfvars`)

---

## Quick Start

### 1. Create your variables file

```bash
cp terraform.tfvars.example terraform.tfvars
```

Fill in the required values in `terraform.tfvars`:

| Variable | Description |
|---|---|
| `tenancy_ocid` | Your OCI tenancy OCID |
| `user_ocid` | Your OCI user OCID |
| `fingerprint` | API key fingerprint |
| `private_key_path` | Path to your OCI API private key (`.pem`) |
| `ssh_public_key_path` | Path to your SSH public key (e.g. `~/.ssh/id_rsa.pub`) |
| `clickhouse_admin_password` | Password for the ClickHouse `admin` user |

### 2. Initialise Terraform

```bash
terraform init
```

### 3. Review the execution plan

```bash
terraform plan
```

The plan will show **~9 resources** to create (VCN, IGW, route table, security list, subnet, instance).

### 4. Apply

```bash
terraform apply
```

Terraform prints the instance public IP and connection URLs when finished.
Wait **~3 minutes** for cloud-init to complete.

---

## Outputs

| Output | Description |
|---|---|
| `instance_public_ip` | Public IP of the ClickHouse VM |
| `instance_private_ip` | Private IP of the ClickHouse VM |
| `clickhouse_http_url` | HTTP interface URL (e.g. `http://<IP>:8123`) |
| `clickhouse_tcp_dsn` | Native TCP address (e.g. `<IP>:9000`) |
| `ssh_command` | Ready-to-use SSH command |

---

## Verifying the Deployment

```bash
# Test HTTP interface (should return "1")
curl "http://$(terraform output -raw instance_public_ip):8123/?query=SELECT+1"

# SSH into the instance and check the container
ssh ubuntu@$(terraform output -raw instance_public_ip)
docker ps
```

---

## Connecting

### clickhouse-client

```bash
clickhouse-client --host <IP> --port 9000 --user admin --password <password>
```

### HTTP API

```bash
curl "http://<IP>:8123/?query=SHOW+DATABASES" \
  --user "admin:<password>"
```

---

## Teardown

```bash
terraform destroy
```

> **Warning**: This permanently deletes the VM and its boot volume, including all ClickHouse data.
> Make sure to back up before destroying.

---

## File Structure

```
terraform/
├── main.tf                    # VCN, networking, compute instance
├── variables.tf               # All input variables
├── outputs.tf                 # Post-apply outputs
├── terraform.tfvars.example   # Template — copy to terraform.tfvars
├── .gitignore                 # Ignores .terraform/, *.tfstate, *.tfvars
├── README.md                  # This file
└── templates/
    └── cloud-init.yaml        # Bootstraps Docker + ClickHouse on first boot
```
