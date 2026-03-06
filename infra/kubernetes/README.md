# Kubernetes Infrastructure — PoC

This directory contains the Kubernetes (OKE) infrastructure for the **GO v2 — Gestor de Oferta** project. It is **completely isolated** from the existing Nomad/compute infrastructure in `infra/compute/`.

> [!NOTE]
> **Networking is managed by a separate team.** The VCN, subnets, gateways, and security rules already exist in OCI. You only need to provide their OCIDs in `terraform.tfvars`.

---

## Directory Structure

```
infra/kubernetes/
├── poc-app/                        # Gateway module copy (PoC application)
│   ├── Dockerfile                  # Self-contained nginx Dockerfile
│   └── configs/
│       └── nginx.conf              # HTTP-only nginx config (no upstreams)
│
├── terraform/                      # Provisions the OKE cluster on OCI
│   ├── main.tf                     # Root: provider + oke and node_pool modules
│   ├── variables.tf
│   ├── outputs.tf
│   ├── terraform.tfvars.example    # Copy to terraform.tfvars and fill in
│   └── modules/
│       ├── oke/                    # OKE cluster (managed control plane)
│       └── node_pool/              # Worker nodes
│
└── manifests/                      # Kubernetes resource definitions
    ├── namespace.yaml              # go-poc namespace
    └── gateway/
        ├── deployment.yaml         # 2-replica gateway deployment
        ├── service.yaml            # ClusterIP service
        └── ingress.yaml            # OCI Load Balancer ingress
```

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Terraform | >= 1.5.0 | [terraform.io](https://developer.hashicorp.com/terraform/install) |
| OCI CLI | latest | [docs.oracle.com](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm) |
| kubectl | >= 1.28 | [kubernetes.io](https://kubernetes.io/docs/tasks/tools/) |
| Docker | latest | [docker.com](https://www.docker.com/get-started/) |

---

## Step 1 — Build and Push the PoC Docker Image

```bash
cd infra/kubernetes/poc-app

# Build
docker build -t gateway-poc:latest .

# Test locally
docker run -p 8080:80 gateway-poc:latest
curl http://localhost:8080/health   # → {"status":"ok"}
curl http://localhost:8080/         # → {"status":"ok","service":"gateway-poc","version":"poc"}

# Tag for GHCR — follows team convention: ghcr.io/tmlmobilidade/go-<module>-<app>:<tag>
docker tag gateway-poc:latest ghcr.io/tmlmobilidade/go-gateway-poc:latest

# Log in to GHCR
# Password = GitHub Personal Access Token with 'write:packages' scope
# Create one: github.com → Settings → Developer settings → Personal access tokens → Generate new token
docker login ghcr.io -u <your-github-username> -p <your-github-pat>

# Push
docker push ghcr.io/tmlmobilidade/go-gateway-poc:latest
```

Then the `image:` in `manifests/gateway/deployment.yaml` is already set to `ghcr.io/tmlmobilidade/go-gateway-poc:latest`.

---

## Step 2 — Provision the OKE Cluster (Terraform)

First, obtain the following OCIDs from the networking team or OCI Console
(**Networking > Virtual Cloud Networks > your VCN > Subnets**):

- `vcn_id` — the existing VCN
- `public_subnet_id` — for the Kubernetes API endpoint and OCI Load Balancers
- `private_subnet_id` — for worker nodes

```bash
cd infra/kubernetes/terraform

# 1. Fill in credentials and networking OCIDs
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars

# Find valid kubernetes_version values:
oci ce cluster-options get --cluster-option-id all --query 'data.kubernetesVersions'

# Find valid node_image_id for your version + region:
oci ce node-pool-options get --node-pool-option-id all

# 2. Initialize
terraform init

# 3. Preview
terraform plan

# 4. Apply (~10-15 minutes)
terraform apply
```

---

## Step 3 — Configure kubectl

Run the `kubeconfig_command` printed in the Terraform output:

```bash
oci ce cluster create-kubeconfig \
  --cluster-id <cluster_id from output> \
  --file $HOME/.kube/config \
  --region eu-frankfurt-1 \
  --token-version 2.0.0 \
  --kube-endpoint PUBLIC_ENDPOINT

# Verify
kubectl get nodes
# Expected: 1 node in Ready state
```

---

## Step 4 — Deploy the PoC Application

```bash
kubectl apply -f infra/kubernetes/manifests/namespace.yaml

# Create the GHCR pull secret (image is private — requires a PAT with read:packages scope)
# Generate a PAT: github.com → Settings → Developer settings → Personal access tokens
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=<github-username> \
  --docker-password=<github-pat-with-read:packages> \
  --namespace go-poc

kubectl apply -f infra/kubernetes/manifests/gateway/

# Monitor
kubectl get pods -n go-poc        # Expected: 2 Running pods
kubectl get ingress -n go-poc     # ADDRESS appears once the LB is provisioned (~2 min)

# Test
curl http://<INGRESS_ADDRESS>/health
# Expected: {"status":"ok"}
```

### Ingress Controller Note

`ingress.yaml` uses the **OCI Native Ingress Controller** (`ingressClassName: native`).

To enable it: OCI Console → Kubernetes Engine → Your Cluster → Add-ons → OCI Native Ingress Controller → Enable

**Simpler alternative:** Change the Service type in `manifests/gateway/service.yaml` from `ClusterIP` to `LoadBalancer` — OKE automatically provisions an OCI Load Balancer without needing an Ingress Controller.

---

## Step 5 — Tear Down

```bash
# Remove Kubernetes resources first
kubectl delete -f infra/kubernetes/manifests/gateway/
kubectl delete -f infra/kubernetes/manifests/namespace.yaml

# Destroy OCI infrastructure (does NOT touch networking — managed by another team)
cd infra/kubernetes/terraform
terraform destroy
```

---

## What's Next

1. **Dockerize more modules** — create `Dockerfile` in each `modules/<name>/`
2. **Add more manifests** — copy the `manifests/gateway/` pattern per module
3. **CI/CD** — automate image builds + `kubectl apply` in GitHub Actions
4. **Horizontal Pod Autoscaler** — auto-scale each module on CPU/memory
5. **Private API endpoint** — move K8s API to the private subnet + VPN/bastion for production
6. **OCI VCN-native CNI** — migrate from Flannel to `OCI_VCN_IP_NATIVE` for better performance
7. **Observability** — deploy Prometheus + Grafana
