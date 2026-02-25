# ClickHouse — Terraform (OCI)

This directory contains a **self-contained** Terraform root that provisions an isolated
ClickHouse database server on Oracle Cloud Infrastructure (OCI).

It creates its own VCN, subnet, internet gateway, route table, security list and a
`VM.Standard.A1.Flex` compute instance (ARM, Always-Free eligible). ClickHouse is
started automatically on first boot via Docker Compose through cloud-init.

---

## Quick Start

### 1. Create your variables file

```bash
cp terraform.tfvars.hcl.example terraform.tfvars.hcl
```

Fill in the required values in `terraform.tfvars.hcl` (OCIDs, keys, and `clickhouse_admin_password`).

### 2. Initialise Terraform

```bash
terraform init
```

### 3. Review and Apply

```bash
terraform plan -var-file=terraform.tfvars.hcl
terraform apply -var-file=terraform.tfvars.hcl
```

---

## Verifying the Deployment

Wait **~5 minutes** after apply finishes, then test the HTTP interface directly:

```bash
curl "http://$(terraform output -raw instance_public_ip):8123/?query=SELECT+1"
# Expected output: 1
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
├── terraform.tfvars.hcl.example # Template — copy to terraform.tfvars.hcl
├── .gitignore                 # Ignores .terraform/, *.tfstate, *.tfvars, *.tfvars.hcl
├── README.md                  # This file
└── templates/
    └── cloud-init.yaml        # Bootstraps Docker + ClickHouse on first boot
```
