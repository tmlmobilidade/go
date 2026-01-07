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

module "gateway" {
	source              = "./modules/gateway"
	compartment_ocid    = var.compartment_ocid
	availability_domain = var.availability_domain
	ssh_authorized_keys = local.ssh_keys
}

module "server" {
	source              = "./modules/server"
	compartment_ocid    = var.compartment_ocid
	availability_domain = var.availability_domain
	ssh_authorized_keys = local.ssh_keys
}

module "worker" {
	source              = "./modules/worker"
	depends_on          = [module.server]
	compartment_ocid    = var.compartment_ocid
	availability_domain = var.availability_domain
	ssh_authorized_keys = local.ssh_keys
}