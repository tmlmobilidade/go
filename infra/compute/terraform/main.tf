# -----------------------------------------------------------------------
# TERRAFORM SETTINGS
# -----------------------------------------------------------------------

terraform {
	required_providers {
		oci = {
			source = "oracle/oci"
		}
	}
}

variable "project_name" {
	type = string
	description = "The name of the project. This will be used as a prefix for resource names and tags."
	default = "iso-go"
}


# -----------------------------------------------------------------------
# OCI AUTHENTICATION VARIABLES
# -----------------------------------------------------------------------

variable "tenancy_ocid" {
	type = string
	description = "The OCID of the Oracle Cloud Infrastructure tenancy."
}

variable "user_ocid" {
	type = string
	description = "The OCID of the Oracle Cloud Infrastructure user."
}

variable "fingerprint" {
	type = string
	description = "The fingerprint of the API key."
}

variable "private_key_path" {
	type = string
	description = "The file path to the private key for OCI API authentication."
}

variable "ssh_public_key_path" {
	type = string
	description = "The file path to the SSH public key for instance access."
}

variable "compartment_ocid" {
	type = string
	description = <<-EOT
	The OCID of the compartment where resources will be created in.
	Current compartment is set to: cmetropolitana
	EOT
	default = "ocid1.compartment.oc1..aaaaaaaaqwnoahpbcxhsogpszdixlv4jnrnujst7qxyar6536oeptpwjtkna"
}

variable "availability_domain" {
	type = string
	description = <<-EOT
	The availability domain where resources will be created.
	This should be the full ID string, e.g., 'LUDo:EU-FRANKFURT-1-AD-1'.
	This can only be found via the OCI CLI or by inspecting the API response
	for VM instance details on the web console.
	EOT
	default = "LUDo:EU-FRANKFURT-1-AD-1"
}

variable "public_subnet_ocid" {
	type = string
	description = <<-EOT
	The OCID of the private subnet for this project.
	Current subnet is set to: cmet-prv
	EOT
	default = "ocid1.subnet.oc1.eu-frankfurt-1.aaaaaaaa4vbr4wpapm3wpa4o73yqytsyqedinrxouelf7ntkefdfuogof6rq"
}

variable "private_subnet_ocid" {
	type = string
	description = <<-EOT
	The OCID of the private subnet for this project.
	Current subnet is set to: cmet-prv
	EOT
	default = "ocid1.subnet.oc1.eu-frankfurt-1.aaaaaaaao7mnezqom22eujji6o3pbbbgtjvkazofcjs2qkvdv6uvpdpbr7fa"
}

variable "private_subnet_dns_suffix" {
	type = string
	description = <<-EOT
	The OCI DNS suffix for the region where resources will be created.
	It changes per VCN configuration, subnet, etc. For example, in
	the Frankfurt region, it can be either 'oraclevcn.com' or
	'oraclevcn.eu-frankfurt-1.oraclecloud.com' depending on the setup
	EOT
	default = "prvcmetro.vcncmetropolita.oraclevcn.com"
}


# -----------------------------------------------------------------------
# PROVIDER CONFIGURATION
# -----------------------------------------------------------------------

provider "oci" {
	tenancy_ocid = var.tenancy_ocid
	user_ocid = var.user_ocid
	fingerprint = var.fingerprint
	private_key_path = var.private_key_path
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
	source = "./modules/gateway"
	project_name = var.project_name
	compartment_ocid = var.compartment_ocid
	availability_domain = var.availability_domain
	ssh_authorized_keys = local.ssh_keys
	public_subnet_ocid = var.public_subnet_ocid
	private_subnet_ocid = var.private_subnet_ocid
	private_subnet_dns_suffix = var.private_subnet_dns_suffix
}

module "orchestrator" {
	source = "./modules/orchestrator"
	project_name = var.project_name
	compartment_ocid = var.compartment_ocid
	availability_domain = var.availability_domain
	ssh_authorized_keys = local.ssh_keys
	private_subnet_ocid = var.private_subnet_ocid
	private_subnet_dns_suffix = var.private_subnet_dns_suffix
}

module "worker" {
	source = "./modules/worker"
	depends_on = [module.orchestrator]
	project_name = var.project_name
	compartment_ocid = var.compartment_ocid
	availability_domain = var.availability_domain
	ssh_authorized_keys = local.ssh_keys
	private_subnet_ocid = var.private_subnet_ocid
	private_subnet_dns_suffix = var.private_subnet_dns_suffix
}