########################
# Common Tags
# Define reusable tags/freeform_tags for all OCI resources.
# Tags help with cost allocation, resource organization, and automation.
########################

locals {
  # Common tags applied to all resources
  common_tags = {
    "Project"     = var.project_name
    "Environment" = var.environment
    "ManagedBy"   = "Terraform"
    "Repository"  = "tmlmobilidade/go"
  }

  # Component-specific tags (to be merged with common_tags)
  server_tags = merge(local.common_tags, {
    "Component" = "nomad-server"
    "Role"      = "server"
  })

  worker_tags = merge(local.common_tags, {
    "Component" = "nomad-worker"
    "Role"      = "worker"
  })

  gateway_tags = merge(local.common_tags, {
    "Component" = "nginx-gateway"
    "Role"      = "gateway"
  })
}

# -----------------------------------------------------
# Resource Naming Convention
# Provides consistent naming across all resources
# -----------------------------------------------------

locals {
  # Name prefix for all resources: project-environment
  name_prefix = "${var.project_name}-${var.environment}"

  # Component-specific prefixes
  server_prefix  = "${local.name_prefix}-server"
  worker_prefix  = "${local.name_prefix}-worker"
  gateway_prefix = "${local.name_prefix}-gateway"
}
