# -----------------------------------------------------------------------
# TERRAFORM SETTINGS
# -----------------------------------------------------------------------

terraform {
	required_version = ">= 1.5.0"
	required_providers {
		oci = {
			source  = "oracle/oci"
			version = ">= 6.0.0"
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
# MODULES
# -----------------------------------------------------------------------
# Networking (VCN, subnets, gateways) is managed by a separate team and
# must already exist in OCI before applying this configuration.
# Provide the existing resource OCIDs as variables in terraform.tfvars.
#
# Resources provisioned here:
#   1. oke       — OKE cluster (managed control plane) in the existing VCN
#   2. node_pool — Worker nodes placed in the existing private subnet
# -----------------------------------------------------------------------

module "oke" {
	source             = "./modules/oke"
	project_name       = var.project_name
	compartment_ocid   = var.compartment_ocid
	kubernetes_version = var.kubernetes_version
	vcn_id             = var.vcn_id
	public_subnet_id   = var.public_subnet_id
	private_subnet_id  = var.private_subnet_id
}

module "node_pool" {
	source              = "./modules/node_pool"
	depends_on          = [module.oke]
	project_name        = var.project_name
	compartment_ocid    = var.compartment_ocid
	cluster_id          = module.oke.cluster_id
	kubernetes_version  = var.kubernetes_version
	availability_domain = var.availability_domain
	private_subnet_id   = var.private_subnet_id
	node_shape          = var.node_shape
	node_ocpus          = var.node_ocpus
	node_memory_in_gbs  = var.node_memory_in_gbs
	node_count          = var.node_count
}
