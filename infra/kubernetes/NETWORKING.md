# Kubernetes — Networking & Security List Rules

This document tracks all OCI security list rules required as modules are progressively replicated into the Kubernetes cluster. Rules are managed by the **networking team** — use this as the source of truth for what to request.

---

## Architecture

```
Internet
   │
   ▼ (pub-go security list — ingress from 0.0.0.0/0)
Proxy VM (10.91.101.4, public: 89.168.126.48) — nginx reverse proxy
   │
   ▼ (prv-go security list — ingress from 10.91.101.0/28)
Worker Nodes (10.91.101.146) — NodePort services
   │
   ▼
Pods (10.244.x.x) — ClusterIP services
```

Each module added to the cluster requires exactly **two security list rules**:
1. A port opened on **pub-go** for internet → proxy VM traffic
2. The corresponding NodePort opened on **prv-go** for proxy VM → worker node traffic

---

## Rules Already in Place

### pub-go Security List

| Protocol | Source        | Port | Purpose                        | Status |
|----------|---------------|------|--------------------------------|--------|
| TCP      | `0.0.0.0/0`  | 22   | SSH to jump server / proxy VM  | ✅ Pre-existing |
| TCP      | `0.0.0.0/0`  | 80   | Internet → proxy (gateway)     | ✅ Added |
| TCP      | `0.0.0.0/0`  | 443  | HTTPS (reserved for TLS)       | ✅ Added |
| ICMP     | `0.0.0.0/0`  | type 3, code 4 | Path MTU discovery | ✅ Pre-existing |

### prv-go Security List

| Protocol | Source               | Port  | Purpose                              | Status |
|----------|----------------------|-------|--------------------------------------|--------|
| ALL      | `10.91.101.128/25`  | any   | Intra-cluster (prv-go to prv-go)     | ✅ Pre-existing |
| TCP      | `10.91.101.11/32`   | 6443  | kubectl from jump server             | ✅ Pre-existing |
| TCP      | `10.91.101.0/28`    | 30080 | Proxy VM → gateway NodePort          | ✅ Added |

---

## Rules Needed Per Module

Rules are listed in the order modules are being replicated. Request each row from the networking team when the corresponding module is ready to be deployed.

### gateway (`go-gateway` namespace)

> Already deployed. Rules in place.

| Security List | Protocol | Source           | Port  | Status |
|---------------|----------|------------------|-------|--------|
| pub-go        | TCP      | `0.0.0.0/0`     | 80    | ✅ Done |
| prv-go        | TCP      | `10.91.101.0/28` | 30080 | ✅ Done |

**Proxy VM port:** 80 | **NodePort:** 30080 | **Namespace:** `go-gateway`

---

### auth (`go-auth` namespace)

| Security List | Protocol | Source           | Port  | Status |
|---------------|----------|------------------|-------|--------|
| pub-go        | TCP      | `0.0.0.0/0`     | 8080  | ⏳ Pending |
| prv-go        | TCP      | `10.91.101.0/28` | 30081 | ⏳ Pending |

**Proxy VM port:** 8080 | **NodePort:** 30081 | **Namespace:** `go-auth`

---

### dates (`go-dates` namespace)

| Security List | Protocol | Source           | Port  | Status |
|---------------|----------|------------------|-------|--------|
| pub-go        | TCP      | `0.0.0.0/0`     | 8081  | ⏳ Pending |
| prv-go        | TCP      | `10.91.101.0/28` | 30082 | ⏳ Pending |

**Proxy VM port:** 8081 | **NodePort:** 30082 | **Namespace:** `go-dates`

---

### stops (`go-stops` namespace)

| Security List | Protocol | Source           | Port  | Status |
|---------------|----------|------------------|-------|--------|
| pub-go        | TCP      | `0.0.0.0/0`     | 8082  | ⏳ Pending |
| prv-go        | TCP      | `10.91.101.0/28` | 30083 | ⏳ Pending |

**Proxy VM port:** 8082 | **NodePort:** 30083 | **Namespace:** `go-stops`

---

### fleet (`go-fleet` namespace)

| Security List | Protocol | Source           | Port  | Status |
|---------------|----------|------------------|-------|--------|
| pub-go        | TCP      | `0.0.0.0/0`     | 8083  | ⏳ Pending |
| prv-go        | TCP      | `10.91.101.0/28` | 30084 | ⏳ Pending |

**Proxy VM port:** 8083 | **NodePort:** 30084 | **Namespace:** `go-fleet`

---

### locations (`go-locations` namespace)

| Security List | Protocol | Source           | Port  | Status |
|---------------|----------|------------------|-------|--------|
| pub-go        | TCP      | `0.0.0.0/0`     | 8084  | ⏳ Pending |
| prv-go        | TCP      | `10.91.101.0/28` | 30085 | ⏳ Pending |

**Proxy VM port:** 8084 | **NodePort:** 30085 | **Namespace:** `go-locations`

---

### offer (`go-offer` namespace)

| Security List | Protocol | Source           | Port  | Status |
|---------------|----------|------------------|-------|--------|
| pub-go        | TCP      | `0.0.0.0/0`     | 8085  | ⏳ Pending |
| prv-go        | TCP      | `10.91.101.0/28` | 30086 | ⏳ Pending |

**Proxy VM port:** 8085 | **NodePort:** 30086 | **Namespace:** `go-offer`

---

### plans (`go-plans` namespace)

| Security List | Protocol | Source           | Port  | Status |
|---------------|----------|------------------|-------|--------|
| pub-go        | TCP      | `0.0.0.0/0`     | 8086  | ⏳ Pending |
| prv-go        | TCP      | `10.91.101.0/28` | 30087 | ⏳ Pending |

**Proxy VM port:** 8086 | **NodePort:** 30087 | **Namespace:** `go-plans`

---

### alerts (`go-alerts` namespace)

| Security List | Protocol | Source           | Port  | Status |
|---------------|----------|------------------|-------|--------|
| pub-go        | TCP      | `0.0.0.0/0`     | 8087  | ⏳ Pending |
| prv-go        | TCP      | `10.91.101.0/28` | 30088 | ⏳ Pending |

**Proxy VM port:** 8087 | **NodePort:** 30088 | **Namespace:** `go-alerts`

---

### performance (`go-performance` namespace)

| Security List | Protocol | Source           | Port  | Status |
|---------------|----------|------------------|-------|--------|
| pub-go        | TCP      | `0.0.0.0/0`     | 8088  | ⏳ Pending |
| prv-go        | TCP      | `10.91.101.0/28` | 30089 | ⏳ Pending |

**Proxy VM port:** 8088 | **NodePort:** 30089 | **Namespace:** `go-performance`

---

### ticketing (`go-ticketing` namespace)

| Security List | Protocol | Source           | Port  | Status |
|---------------|----------|------------------|-------|--------|
| pub-go        | TCP      | `0.0.0.0/0`     | 8089  | ⏳ Pending |
| prv-go        | TCP      | `10.91.101.0/28` | 30090 | ⏳ Pending |

**Proxy VM port:** 8089 | **NodePort:** 30090 | **Namespace:** `go-ticketing`

---

### exporter (`go-exporter` namespace)

| Security List | Protocol | Source           | Port  | Status |
|---------------|----------|------------------|-------|--------|
| pub-go        | TCP      | `0.0.0.0/0`     | 8090  | ⏳ Pending |
| prv-go        | TCP      | `10.91.101.0/28` | 30091 | ⏳ Pending |

**Proxy VM port:** 8090 | **NodePort:** 30091 | **Namespace:** `go-exporter`

---

### controller (`go-controller` namespace)

| Security List | Protocol | Source           | Port  | Status |
|---------------|----------|------------------|-------|--------|
| pub-go        | TCP      | `0.0.0.0/0`     | 8091  | ⏳ Pending |
| prv-go        | TCP      | `10.91.101.0/28` | 30092 | ⏳ Pending |

**Proxy VM port:** 8091 | **NodePort:** 30092 | **Namespace:** `go-controller`

---

### replicator (`go-replicator` namespace)

> Internal only — no public-facing frontend or API. No pub-go rule needed.

| Security List | Protocol | Source           | Port  | Status |
|---------------|----------|------------------|-------|--------|
| prv-go        | TCP      | `10.91.101.0/28` | 30093 | ⏳ Pending |

**NodePort:** 30093 | **Namespace:** `go-replicator`

---

## Port Reference Table

| Module       | Proxy VM Port | NodePort | Namespace          |
|--------------|---------------|----------|--------------------|
| gateway      | 80            | 30080    | `go-gateway`       |
| auth         | 8080          | 30081    | `go-auth`          |
| dates        | 8081          | 30082    | `go-dates`         |
| stops        | 8082          | 30083    | `go-stops`         |
| fleet        | 8083          | 30084    | `go-fleet`         |
| locations    | 8084          | 30085    | `go-locations`     |
| offer        | 8085          | 30086    | `go-offer`         |
| plans        | 8086          | 30087    | `go-plans`         |
| alerts       | 8087          | 30088    | `go-alerts`        |
| performance  | 8088          | 30089    | `go-performance`   |
| ticketing    | 8089          | 30090    | `go-ticketing`     |
| exporter     | 8090          | 30091    | `go-exporter`      |
| controller   | 8091          | 30092    | `go-controller`    |
| replicator   | —             | 30093    | `go-replicator`    |
