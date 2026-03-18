#!/bin/bash
# Generates Kubernetes manifests for all remaining GO modules.
# Run from any directory: bash infra/kubernetes/generate-manifests.sh

BASE="c:/Users/User/Documents/Projects/go/infra/kubernetes/manifests"

# ─── Helpers ─────────────────────────────────────────────────────────────────

svc_nginx() {
  local MOD=$1 NP=$2
  cat > "$BASE/$MOD/service-nginx.yaml" << EOF
apiVersion: v1
kind: Service
metadata:
  name: ${MOD}-nginx
  namespace: go-${MOD}
  labels:
    app: ${MOD}-nginx
    app.kubernetes.io/name: ${MOD}-nginx
    app.kubernetes.io/part-of: go-${MOD}
spec:
  type: NodePort
  selector:
    app: ${MOD}-nginx
  ports:
    - name: http
      port: 80
      targetPort: http
      nodePort: ${NP}
      protocol: TCP
EOF
}

svc_api() {
  local MOD=$1
  cat > "$BASE/$MOD/service-api.yaml" << EOF
apiVersion: v1
kind: Service
metadata:
  # Name must match the upstream in the baked-in nginx config: "server api:5050"
  name: api
  namespace: go-${MOD}
  labels:
    app: ${MOD}-api
    app.kubernetes.io/name: ${MOD}-api
    app.kubernetes.io/part-of: go-${MOD}
spec:
  type: ClusterIP
  selector:
    app: ${MOD}-api
  ports:
    - name: http
      port: 5050
      targetPort: http
      protocol: TCP
EOF
}

svc_frontend() {
  local MOD=$1
  cat > "$BASE/$MOD/service-frontend.yaml" << EOF
apiVersion: v1
kind: Service
metadata:
  # Name must match the upstream in the baked-in nginx config: "server frontend:3000"
  name: frontend
  namespace: go-${MOD}
  labels:
    app: ${MOD}-frontend
    app.kubernetes.io/name: ${MOD}-frontend
    app.kubernetes.io/part-of: go-${MOD}
spec:
  type: ClusterIP
  selector:
    app: ${MOD}-frontend
  ports:
    - name: http
      port: 3000
      targetPort: http
      protocol: TCP
EOF
}

svc_named() {
  # Generic named ClusterIP service (for coordinator etc.)
  local MOD=$1 SVC_NAME=$2 APP_LABEL=$3 PORT=$4
  cat > "$BASE/$MOD/service-${SVC_NAME}.yaml" << EOF
apiVersion: v1
kind: Service
metadata:
  name: ${SVC_NAME}
  namespace: go-${MOD}
  labels:
    app: ${APP_LABEL}
    app.kubernetes.io/name: ${APP_LABEL}
    app.kubernetes.io/part-of: go-${MOD}
spec:
  type: ClusterIP
  selector:
    app: ${APP_LABEL}
  ports:
    - name: http
      port: ${PORT}
      targetPort: http
      protocol: TCP
EOF
}

dep_nginx() {
  local MOD=$1
  cat > "$BASE/$MOD/deployment-nginx.yaml" << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${MOD}-nginx
  namespace: go-${MOD}
  labels:
    app: ${MOD}-nginx
    app.kubernetes.io/name: ${MOD}-nginx
    app.kubernetes.io/component: nginx
    app.kubernetes.io/part-of: go-${MOD}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ${MOD}-nginx
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0
      maxSurge: 1
  template:
    metadata:
      labels:
        app: ${MOD}-nginx
    spec:
      imagePullSecrets:
        - name: ghcr-secret
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 100
              podAffinityTerm:
                labelSelector:
                  matchExpressions:
                    - key: app
                      operator: In
                      values: [${MOD}-nginx]
                topologyKey: kubernetes.io/hostname
      containers:
        - name: nginx
          image: ghcr.io/tmlmobilidade/go-${MOD}-nginx:staging
          imagePullPolicy: Always
          ports:
            - name: http
              containerPort: 80
              protocol: TCP
          livenessProbe:
            tcpSocket:
              port: http
            initialDelaySeconds: 10
            periodSeconds: 15
            failureThreshold: 3
          readinessProbe:
            tcpSocket:
              port: http
            initialDelaySeconds: 5
            periodSeconds: 10
            failureThreshold: 3
          resources:
            requests:
              cpu: 50m
              memory: 32Mi
            limits:
              cpu: 200m
              memory: 128Mi
EOF
}

dep_api() {
  local MOD=$1
  cat > "$BASE/$MOD/deployment-api.yaml" << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${MOD}-api
  namespace: go-${MOD}
  labels:
    app: ${MOD}-api
    app.kubernetes.io/name: ${MOD}-api
    app.kubernetes.io/component: api
    app.kubernetes.io/part-of: go-${MOD}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ${MOD}-api
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0
      maxSurge: 1
  template:
    metadata:
      labels:
        app: ${MOD}-api
    spec:
      imagePullSecrets:
        - name: ghcr-secret
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 100
              podAffinityTerm:
                labelSelector:
                  matchExpressions:
                    - key: app
                      operator: In
                      values: [${MOD}-api]
                topologyKey: kubernetes.io/hostname
      containers:
        - name: api
          image: ghcr.io/tmlmobilidade/go-${MOD}-api:staging
          imagePullPolicy: Always
          ports:
            - name: http
              containerPort: 5050
              protocol: TCP
          envFrom:
            - secretRef:
                name: ${MOD}-secret
          livenessProbe:
            httpGet:
              path: /
              port: http
            initialDelaySeconds: 20
            periodSeconds: 15
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /
              port: http
            initialDelaySeconds: 10
            periodSeconds: 10
            failureThreshold: 3
          resources:
            requests:
              cpu: 100m
              memory: 256Mi
            limits:
              cpu: 500m
              memory: 1Gi
EOF
}

dep_frontend() {
  local MOD=$1
  cat > "$BASE/$MOD/deployment-frontend.yaml" << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${MOD}-frontend
  namespace: go-${MOD}
  labels:
    app: ${MOD}-frontend
    app.kubernetes.io/name: ${MOD}-frontend
    app.kubernetes.io/component: frontend
    app.kubernetes.io/part-of: go-${MOD}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ${MOD}-frontend
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0
      maxSurge: 1
  template:
    metadata:
      labels:
        app: ${MOD}-frontend
    spec:
      imagePullSecrets:
        - name: ghcr-secret
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 100
              podAffinityTerm:
                labelSelector:
                  matchExpressions:
                    - key: app
                      operator: In
                      values: [${MOD}-frontend]
                topologyKey: kubernetes.io/hostname
      containers:
        - name: frontend
          image: ghcr.io/tmlmobilidade/go-${MOD}-frontend:staging
          imagePullPolicy: Always
          ports:
            - name: http
              containerPort: 3000
              protocol: TCP
          envFrom:
            - secretRef:
                name: ${MOD}-secret
          livenessProbe:
            httpGet:
              path: /${MOD}
              port: http
            initialDelaySeconds: 30
            periodSeconds: 15
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /${MOD}
              port: http
            initialDelaySeconds: 15
            periodSeconds: 10
            failureThreshold: 3
          resources:
            requests:
              cpu: 100m
              memory: 256Mi
            limits:
              cpu: 500m
              memory: 1Gi
EOF
}

dep_worker() {
  # Background worker — no HTTP port, no probes
  local MOD=$1 APP=$2
  local APP_LABEL="${MOD}-${3:-$2}"
  cat > "$BASE/$MOD/deployment-${APP}.yaml" << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${APP_LABEL}
  namespace: go-${MOD}
  labels:
    app: ${APP_LABEL}
    app.kubernetes.io/name: ${APP_LABEL}
    app.kubernetes.io/component: worker
    app.kubernetes.io/part-of: go-${MOD}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ${APP_LABEL}
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 0
  template:
    metadata:
      labels:
        app: ${APP_LABEL}
    spec:
      imagePullSecrets:
        - name: ghcr-secret
      containers:
        - name: ${APP}
          image: ghcr.io/tmlmobilidade/go-${MOD}-${APP}:staging
          imagePullPolicy: Always
          envFrom:
            - secretRef:
                name: ${MOD}-secret
          resources:
            requests:
              cpu: 50m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi
EOF
}

dep_coordinator() {
  # Coordinator is a worker that also exposes an HTTP port
  local MOD=$1
  cat > "$BASE/$MOD/deployment-coordinator.yaml" << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${MOD}-coordinator
  namespace: go-${MOD}
  labels:
    app: ${MOD}-coordinator
    app.kubernetes.io/name: ${MOD}-coordinator
    app.kubernetes.io/component: coordinator
    app.kubernetes.io/part-of: go-${MOD}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ${MOD}-coordinator
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0
      maxSurge: 1
  template:
    metadata:
      labels:
        app: ${MOD}-coordinator
    spec:
      imagePullSecrets:
        - name: ghcr-secret
      containers:
        - name: coordinator
          image: ghcr.io/tmlmobilidade/go-${MOD}-coordinator:staging
          imagePullPolicy: Always
          ports:
            - name: http
              containerPort: 5050
              protocol: TCP
          envFrom:
            - secretRef:
                name: ${MOD}-secret
          livenessProbe:
            httpGet:
              path: /
              port: http
            initialDelaySeconds: 20
            periodSeconds: 15
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /
              port: http
            initialDelaySeconds: 10
            periodSeconds: 10
            failureThreshold: 3
          resources:
            requests:
              cpu: 100m
              memory: 256Mi
            limits:
              cpu: 500m
              memory: 1Gi
EOF
}

# ─── Secrets ─────────────────────────────────────────────────────────────────

secret_simple() {
  local MOD=$1
  cat > "$BASE/$MOD/secret.yaml" << EOF
# # #
# Fill in all values before applying.
# Apply with: kubectl apply -f manifests/${MOD}/secret.yaml
# WARNING: Do not commit this file with real values.

apiVersion: v1
kind: Secret
metadata:
  name: ${MOD}-secret
  namespace: go-${MOD}
type: Opaque
stringData:
  ENVIRONMENT: "staging"

  ## DATABASE
  DATABASE_URI: ""
EOF
}

secret_standard() {
  local MOD=$1
  cat > "$BASE/$MOD/secret.yaml" << EOF
# # #
# Fill in all values before applying.
# Apply with: kubectl apply -f manifests/${MOD}/secret.yaml
# WARNING: Do not commit this file with real values.

apiVersion: v1
kind: Secret
metadata:
  name: ${MOD}-secret
  namespace: go-${MOD}
type: Opaque
stringData:
  ENVIRONMENT: "staging"

  ## DATABASE
  DATABASE_URI: ""

  ## EMAIL
  TML_PROVIDER_EMAIL_SERVER_HOST: ""
  TML_PROVIDER_EMAIL_SERVER_PORT: ""
  TML_PROVIDER_EMAIL_SERVER_USER: ""
  TML_PROVIDER_EMAIL_SERVER_PASSWORD: ""
  TML_PROVIDER_EMAIL_FROM: ""

  ## FILES
  OCI_USER: ""
  OCI_FINGERPRINT: ""
  OCI_TENANCY: ""
  OCI_REGION: ""
  OCI_PRIVATE_KEY: ""
  OCI_NAMESPACE: ""
  OCI_BUCKET_NAME: ""
  STORAGE_TYPE: ""
EOF
}

secret_alerts() {
  cat > "$BASE/alerts/secret.yaml" << 'EOF'
# # #
# Fill in all values before applying.
# Apply with: kubectl apply -f manifests/alerts/secret.yaml
# WARNING: Do not commit this file with real values.

apiVersion: v1
kind: Secret
metadata:
  name: alerts-secret
  namespace: go-alerts
type: Opaque
stringData:
  ENVIRONMENT: "staging"

  ## DATABASE
  DATABASE_URI: ""

  ## EMAIL
  TML_PROVIDER_EMAIL_SERVER_HOST: ""
  TML_PROVIDER_EMAIL_SERVER_PORT: ""
  TML_PROVIDER_EMAIL_SERVER_USER: ""
  TML_PROVIDER_EMAIL_SERVER_PASSWORD: ""
  TML_PROVIDER_EMAIL_FROM: ""

  ## FILES
  OCI_USER: ""
  OCI_FINGERPRINT: ""
  OCI_TENANCY: ""
  OCI_REGION: ""
  OCI_PRIVATE_KEY: ""
  OCI_NAMESPACE: ""
  OCI_BUCKET_NAME: ""
  STORAGE_TYPE: ""

  ## DATIK
  DATIK_API_URL: ""
EOF
}

secret_controller() {
  cat > "$BASE/controller/secret.yaml" << 'EOF'
# # #
# Fill in all values before applying.
# Apply with: kubectl apply -f manifests/controller/secret.yaml
# WARNING: Do not commit this file with real values.

apiVersion: v1
kind: Secret
metadata:
  name: controller-secret
  namespace: go-controller
type: Opaque
stringData:
  ENVIRONMENT: "staging"

  ## GENERAL
  COORDINATOR_URL: "http://coordinator:5050"

  ## DATABASE
  DATABASE_URI: ""

  ## EMAIL
  TML_PROVIDER_EMAIL_SERVER_HOST: ""
  TML_PROVIDER_EMAIL_SERVER_PORT: ""
  TML_PROVIDER_EMAIL_SERVER_USER: ""
  TML_PROVIDER_EMAIL_SERVER_PASSWORD: ""
  TML_PROVIDER_EMAIL_FROM: ""

  ## FILES
  OCI_USER: ""
  OCI_FINGERPRINT: ""
  OCI_TENANCY: ""
  OCI_REGION: ""
  OCI_PRIVATE_KEY: ""
  OCI_NAMESPACE: ""
  OCI_BUCKET_NAME: ""
  STORAGE_TYPE: ""

  ## BRIDGEDB (POSTGRES)
  POSTGRES_DB: ""
  POSTGRES_USER: ""
  POSTGRES_PASSWORD: ""

  ## BRIDGEDB
  BRIDGEDB_HOST: ""
  BRIDGEDB_PORT: ""
  BRIDGEDB_DB: ""
  BRIDGEDB_USER: ""
  BRIDGEDB_PASSWORD: ""
EOF
}

secret_replicator() {
  cat > "$BASE/replicator/secret.yaml" << 'EOF'
# # #
# Fill in all values before applying.
# Apply with: kubectl apply -f manifests/replicator/secret.yaml
# WARNING: Do not commit this file with real values.

apiVersion: v1
kind: Secret
metadata:
  name: replicator-secret
  namespace: go-replicator
type: Opaque
stringData:
  ENVIRONMENT: "staging"

  ## DATABASE
  DATABASE_URI: ""

  ## PCGIDB LEGACY
  PCGIDB_LEGACY_USER: ""
  PCGIDB_LEGACY_PASSWORD: ""
  PCGIDB_LEGACY_ADDRESS_1: ""
  PCGIDB_LEGACY_ADDRESS_2: ""
  PCGIDB_LEGACY_ADDRESS_3: ""
  PCGIDB_LEGACY_PORT: ""

  ## PCGIDB VALIDATIONS
  PCGIDB_VALIDATIONS_USER: ""
  PCGIDB_VALIDATIONS_PASSWORD: ""
  PCGIDB_VALIDATIONS_ADDRESS_1: ""
  PCGIDB_VALIDATIONS_ADDRESS_2: ""
  PCGIDB_VALIDATIONS_ADDRESS_3: ""
  PCGIDB_VALIDATIONS_PORT: ""

  ## PCGIDB TICKETING
  PCGIDB_TICKETING_USER: ""
  PCGIDB_TICKETING_PASSWORD: ""
  PCGIDB_TICKETING_ADDRESS_1: ""
  PCGIDB_TICKETING_ADDRESS_2: ""
  PCGIDB_TICKETING_ADDRESS_3: ""
  PCGIDB_TICKETING_PORT: ""

  ## PCGIDB SSH TUNNEL
  PCGIDB_TUNNEL_LOCAL_PORT: ""
  PCGIDB_TUNNEL_SSH_HOST: ""
  PCGIDB_TUNNEL_SSH_USERNAME: ""

  ## CLICKHOUSE
  CLICKHOUSE_HOST: ""
  CLICKHOUSE_PORT: "8443"
  CLICKHOUSE_DATABASE: ""
  CLICKHOUSE_USERNAME: ""
  CLICKHOUSE_PASSWORD: ""
  CLICKHOUSE_TLS: "true"
EOF
}

# ─── Generate modules ────────────────────────────────────────────────────────

# locations
mkdir -p "$BASE/locations"
secret_simple locations
svc_nginx locations 30085; svc_api locations; svc_frontend locations
dep_nginx locations; dep_api locations; dep_frontend locations

# offer
mkdir -p "$BASE/offer"
secret_standard offer
svc_nginx offer 30086; svc_api offer; svc_frontend offer
dep_nginx offer; dep_api offer; dep_frontend offer

# ticketing
mkdir -p "$BASE/ticketing"
secret_standard ticketing
svc_nginx ticketing 30090; svc_api ticketing; svc_frontend ticketing
dep_nginx ticketing; dep_api ticketing; dep_frontend ticketing

# alerts
mkdir -p "$BASE/alerts"
secret_alerts
svc_nginx alerts 30088; svc_api alerts; svc_frontend alerts
dep_nginx alerts; dep_api alerts; dep_frontend alerts
dep_worker alerts sync-datik

# stops
mkdir -p "$BASE/stops"
secret_standard stops
svc_nginx stops 30083; svc_api stops; svc_frontend stops
dep_nginx stops; dep_api stops; dep_frontend stops
dep_worker stops organizer

# plans
mkdir -p "$BASE/plans"
secret_standard plans
svc_nginx plans 30087; svc_api plans; svc_frontend plans
dep_nginx plans; dep_api plans; dep_frontend plans
dep_worker plans cleaner
dep_worker plans validator

# performance
mkdir -p "$BASE/performance"
secret_simple performance
svc_nginx performance 30089; svc_api performance; svc_frontend performance
dep_nginx performance; dep_api performance; dep_frontend performance
dep_worker performance sync-metrics-daily
dep_worker performance sync-metrics-hourly
dep_worker performance sync-metrics-realtime

# exporter
mkdir -p "$BASE/exporter"
secret_standard exporter
svc_nginx exporter 30091; svc_api exporter; svc_frontend exporter
dep_nginx exporter; dep_api exporter; dep_frontend exporter
dep_worker exporter cleaner
dep_worker exporter export-drt
dep_worker exporter export-files
dep_worker exporter export-gtfs-merged
dep_worker exporter export-posters

# controller
mkdir -p "$BASE/controller"
secret_controller
svc_nginx controller 30092; svc_api controller; svc_frontend controller
svc_named controller coordinator controller-coordinator 5050
dep_nginx controller; dep_api controller; dep_frontend controller
dep_coordinator controller
dep_worker controller rides-acceptor
dep_worker controller rides-bridge
dep_worker controller rides-cleaner
dep_worker controller rides-examiner
dep_worker controller rides-feeder
dep_worker controller rides-locker
dep_worker controller sams-examiner
dep_worker controller sams-feeder

# replicator (workers only — no nginx/api/frontend)
mkdir -p "$BASE/replicator"
secret_replicator
dep_worker replicator organizer
dep_worker replicator stream
dep_worker replicator sync-apex-locations
dep_worker replicator sync-apex-on-board-refunds
dep_worker replicator sync-apex-on-board-sales
dep_worker replicator sync-apex-validations
dep_worker replicator sync-apex-validations-clickhouse
dep_worker replicator sync-vehicle-events
dep_worker replicator sync-vehicle-events-clickhouse

echo "Done. All manifests generated."
