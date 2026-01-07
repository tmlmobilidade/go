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


# -----------------------------------------------------------------------
# PROVIDER CONFIGURATION
# -----------------------------------------------------------------------

provider "oci" {
	tenancy_ocid     = var.tenancy_ocid
	user_ocid        = var.user_ocid
	fingerprint      = var.fingerprint
	private_key_path = var.private_key_path
	region           = var.region
}


# -----------------------------------------------------------------------
# LOCALS
# -----------------------------------------------------------------------
# Used to simplify repeated values and complex
# expressions throughout the configuration.
# -----------------------------------------------------------------------

locals {
	ssh_keys = file(var.ssh_public_key_path)
}


# -----------------------------------------------------------------------
# MODULES
# -----------------------------------------------------------------------
# A module is a container for multiple resources that are used together.
# Modules can be used to create lightweight abstractions, so that you can
# describe your infrastructure in terms of its architecture, rather than
# directly in terms of physical objects. Comment out these module blocks
# if you do not wish to deploy them.
# -----------------------------------------------------------------------

module "nginx_gateway" {
	source              = "./modules/nginx-gateway"
	count               = var.deploy_gateway ? 1 : 0
	compartment_ocid    = var.compartment_ocid
	availability_domain = var.availability_domain
	subnet_ocid         = var.subnet_ocid
	image_ocid          = var.gateway_image_ocid
	ssh_authorized_keys = local.ssh_keys
	instance_count      = var.gateway_count
}

module "nomad_server" {
	source              = "./modules/nomad-server"
	compartment_ocid    = var.compartment_ocid
	availability_domain = var.availability_domain
	subnet_ocid         = var.subnet_ocid
	image_ocid          = var.server_image_ocid
	instance_count      = var.server_count
	ssh_authorized_keys = local.ssh_keys
}

module "nomad_worker" {
	source              = "./modules/nomad-worker"
	depends_on          = [module.nomad_server]
	compartment_ocid    = var.compartment_ocid
	availability_domain = var.availability_domain
	subnet_ocid         = var.subnet_ocid
	image_ocid          = var.worker_image_ocid
	instance_count      = var.worker_count
	ssh_authorized_keys = local.ssh_keys
}