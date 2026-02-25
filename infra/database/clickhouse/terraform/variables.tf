# # #
# TERRAFORM VARIABLES
# Define variables for the ClickHouse Terraform root module.


# -----------------------------------------------------------------------
# PROJECT
# -----------------------------------------------------------------------

variable "project_name" {
	type        = string
	description = "The name of the project. Used as a prefix for resource names and tags."
	default     = "iso-go"
}

variable "module_name" {
	type        = string
	description = "The component name for this module. Used for tagging and identification."
	default     = "clickhouse"
}


# -----------------------------------------------------------------------
# OCI AUTHENTICATION
# -----------------------------------------------------------------------

variable "tenancy_ocid" {
	type        = string
	description = "The OCID of the Oracle Cloud Infrastructure tenancy."
}

variable "user_ocid" {
	type        = string
	description = "The OCID of the Oracle Cloud Infrastructure user."
}

variable "fingerprint" {
	type        = string
	description = "The fingerprint of the API key."
}

variable "private_key_path" {
	type        = string
	description = "The file path to the private key for OCI API authentication."
}

variable "ssh_public_key_path" {
	type        = string
	description = "The file path to the SSH public key for instance access."
}

# NOTE: The following two variables are declared here so the shared terraform.tfvars
# can include them without causing 'undeclared variable' errors.
# They are only consumed by Packer (packer.auto.pkrvars.hcl), not by Terraform.

variable "ssh_private_key_path" {
	type        = string
	description = "SSH private key path. Declared here for tfvars compatibility; used only by Packer."
	default     = ""
}

variable "packer_subnet_ocid" {
	type        = string
	description = "Existing subnet for Packer build instance. Declared here for tfvars compatibility; used only by Packer."
	default     = ""
}


# -----------------------------------------------------------------------
# OCI PLACEMENT
# -----------------------------------------------------------------------

variable "compartment_ocid" {
	type        = string
	description = <<-EOT
	The OCID of the compartment where resources will be created in.
	Current compartment is set to: cmet
	EOT
	default     = "ocid1.compartment.oc1..aaaaaaaaqwnoahpbcxhsogpszdixlv4jnrnujst7qxyar6536oeptpwjtkna"
}

variable "availability_domain" {
	type        = string
	description = <<-EOT
	The availability domain where resources will be created.
	This should be the full ID string, e.g., 'LUDo:EU-FRANKFURT-1-AD-1'.
	EOT
	default     = "LUDo:EU-FRANKFURT-1-AD-1"
}

variable "region" {
	type        = string
	description = "The OCI region to deploy resources in."
	default     = "eu-frankfurt-1"
}


# -----------------------------------------------------------------------
# VM SHAPE
# -----------------------------------------------------------------------

variable "base_image_ocid" {
	type        = string
	description = <<-EOT
	The OCID of the base Ubuntu image. Used by Packer as the build source and
	by Terraform as a fallback if no Packer-built image is found.
	Defaults to Canonical Ubuntu 22.04 Minimal aarch64 in eu-frankfurt-1.
	EOT
	# Canonical-Ubuntu-22.04-Minimal-aarch64-2026.01.29-0 in eu-frankfurt-1
	default = "ocid1.image.oc1.eu-frankfurt-1.aaaaaaaaehm3rohfjplxw73gzlyhp4gy2xtym33utccjawp3b5hivi7tbvlq"
}

variable "vm_shape" {
	type        = string
	description = <<-EOT
	The shape of the VM (compute resources).
	Defaults to VM.Standard.A1.Flex (ARM/Ampere), which is part of the OCI Always Free tier.
	EOT
	default     = "VM.Standard.A1.Flex"
}

variable "vm_ocpus" {
	type        = number
	description = "The number of OCPUs to allocate to the ClickHouse VM."
	default     = 2
}

variable "vm_memory_in_gbs" {
	type        = number
	description = "The amount of memory in GBs to allocate to the ClickHouse VM."
	default     = 12
}

variable "boot_volume_size_in_gbs" {
	type        = number
	description = "The size of the boot volume in GBs."
	default     = 50
}

variable "data_volume_size_in_gbs" {
	type        = number
	description = "The size of the dedicated data volume in GBs."
	default     = 1024
}

variable "data_volume_vpus_per_gb" {
	type        = number
	description = <<-EOT
	The number of Volume Performance Units (VPUs) per GB.
	0: Lower Cost, 10: Balanced (Default), 20: Higher Performance.
	EOT
	default     = 10
}


# -----------------------------------------------------------------------
# NETWORK
# -----------------------------------------------------------------------

variable "vcn_cidr" {
	type        = string
	description = "The CIDR block for the dedicated ClickHouse VCN."
	default     = "10.10.0.0/16"
}

variable "subnet_cidr" {
	type        = string
	description = "The CIDR block for the ClickHouse public subnet."
	default     = "10.10.1.0/24"
}

variable "allowed_ingress_cidrs" {
	type        = list(string)
	description = <<-EOT
	List of CIDR ranges permitted to reach the ClickHouse ports.
	Defaults to open (0.0.0.0/0). Restrict to known IPs in production.
	EOT
	default     = ["0.0.0.0/0"]
}


# -----------------------------------------------------------------------
# CLICKHOUSE
# -----------------------------------------------------------------------

variable "clickhouse_http_port" {
	type        = number
	description = "The ClickHouse HTTP interface port."
	default     = 8123
}

variable "clickhouse_tcp_port" {
	type        = number
	description = "The ClickHouse native TCP port."
	default     = 9000
}

variable "clickhouse_admin_password" {
	type        = string
	sensitive   = true
	description = "The password for the ClickHouse default admin user."
}
