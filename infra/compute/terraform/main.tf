########################
# Nomad Cluster on OCI
########################

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = ">= 5.0.0"
    }
  }
}

provider "oci" {
  tenancy_ocid     = var.tenancy_ocid
  user_ocid        = var.user_ocid
  fingerprint      = var.fingerprint
  private_key_path = var.private_key_path
  region           = var.region
}

locals {
  ssh_keys = file(var.ssh_public_key_path)
  tags = {
    Project   = "nomad-cluster"
    ManagedBy = "terraform"
  }
}

# Nomad Servers
module "nomad_server" {
  source              = "./modules/nomad-server"
  compartment_ocid    = var.compartment_ocid
  availability_domain = var.availability_domain
  subnet_ocid         = var.subnet_ocid
  image_ocid          = var.server_image_ocid
  ssh_authorized_keys = local.ssh_keys
  instance_count      = var.server_count
  freeform_tags       = local.tags
}

# Nomad Workers
module "nomad_worker" {
  source              = "./modules/nomad-worker"
  depends_on          = [module.nomad_server]
  compartment_ocid    = var.compartment_ocid
  availability_domain = var.availability_domain
  subnet_ocid         = var.subnet_ocid
  image_ocid          = var.worker_image_ocid
  ssh_authorized_keys = local.ssh_keys
  instance_count      = var.worker_count
  freeform_tags       = local.tags
}

# Nginx Gateway (optional)
module "nginx_gateway" {
  source              = "./modules/nginx-gateway"
  count               = var.deploy_gateway ? 1 : 0
  compartment_ocid    = var.compartment_ocid
  availability_domain = var.availability_domain
  subnet_ocid         = var.subnet_ocid
  image_ocid          = var.gateway_image_ocid
  ssh_authorized_keys = local.ssh_keys
  instance_count      = var.gateway_count
  freeform_tags       = local.tags
}