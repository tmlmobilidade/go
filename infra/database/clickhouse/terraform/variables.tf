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


# -----------------------------------------------------------------------
# OCI PLACEMENT
# -----------------------------------------------------------------------

variable "compartment_ocid" {
	type        = string
	description = <<-EOT
	The OCID of the compartment where resources will be created in.
	Current compartment is set to: cmetropolitana
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

variable "image_ocid" {
	type        = string
	description = <<-EOT
	The OCID of the base image to use for this VM.
	Defaults to Canonical Ubuntu 22.04 Minimal aarch64 in eu-frankfurt-1.
	Update this when a newer minimal Ubuntu image is published.
	EOT
	# Canonical-Ubuntu-22.04-Minimal-aarch64-2024.11.30-0 in eu-frankfurt-1
	default = "ocid1.image.oc1.eu-frankfurt-1.aaaaaaaavbpjlezqlvsywwhqjt2yqozbzzn36hupg3mvmxnymfbxwjhm4ana"
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
	description = "The size of the boot volume in GBs. ClickHouse data is stored here."
	default     = 100
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
	Only used when ssh_tunnel_only = false.
	EOT
	default     = ["0.0.0.0/0"]
}

variable "ssh_tunnel_only" {
	type        = bool
	description = <<-EOT
	When true (default), ClickHouse ports (8123, 9000) are NOT open to the internet.
	You connect by forwarding those ports over SSH:
	  ssh -L 8123:localhost:8123 -L 9000:localhost:9000 ubuntu@<public_ip>
	Only SSH (port 22) is open publicly — the database is invisible from the internet.
	Set to false to open the ports (restricted to allowed_ingress_cidrs).
	EOT
	default     = true
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
