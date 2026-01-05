job "tmlmobilidade-go-stops" {
  datacenters = ["dc1"]
  namespace   = "production"
  type        = "service"

  update {
    max_parallel     = 1
    min_healthy_time = "30s"
    healthy_deadline = "5m"
    auto_revert      = true
  }

  group "go-stops" {
    count = 1

    restart {
      attempts = 3
      interval = "5m"
      delay    = "30s"
      mode     = "delay"
    }

    network {
      mode = "bridge"
    }

    task "api" {
      driver = "docker"

      config {
        image = "ghcr.io/tmlmobilidade/go-stops-api:production"
        ports = []
      }

      resources {
        memory = 6144
      }

      env {
        ENVIRONMENT = "production"
      }

      template {
        destination = "secrets/env"
        env         = true
        data        = <<EOF
{{ with secret "secret/data/go-stops" }}
{{ range $k, $v := .Data.data }}
{{ $k }}={{ $v }}
{{ end }}
{{ end }}
EOF
      }

      service {
        name = "go-stops-api"
        port = "http"

        check {
          type     = "http"
          path     = "/health"
          interval = "10s"
          timeout  = "2s"
        }
      }
    }

    task "frontend" {
      driver = "docker"

      config {
        image = "ghcr.io/tmlmobilidade/go-stops-frontend:production"
      }

      resources {
        memory = 4096
      }

      env {
        ENVIRONMENT = "production"
      }

      service {
        name = "go-stops-frontend"
      }
    }

    task "organizer" {
      driver = "docker"

      config {
        image = "ghcr.io/tmlmobilidade/go-stops-organizer:production"
      }

      resources {
        memory = 4096
      }

      env {
        ENVIRONMENT = "production"
      }

      service {
        name = "go-stops-organizer"
      }
    }
  }
}