# # #
# TERRAFORM VARIABLES
# Define variables for the ClickHouse Replica Set Terraform root module.


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
	default     = "clickhouse-replica"
}

variable "instance_count" {
	type        = number
	description = "Number of ClickHouse replica nodes to provision."
	default     = 3
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
	description = "The OCID of the OCI user (e.g. tiago.macedo) used for API authentication."
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

# NOTE: Declared for shared terraform.tfvars compatibility; used only by Packer.
variable "ssh_private_key_path" {
	type        = string
	description = "SSH private key path. Declared here for tfvars compatibility; used only by Packer."
	default     = ""
}

variable "packer_subnet_ocid" {
	type        = string
	description = "Existing subnet OCID for the Packer build instance. Defaults to the shared pub-cmet subnet."
	default     = "ocid1.subnet.oc1.eu-frankfurt-1.aaaaaaaa4vbr4wpapm3wpa4o73yqytsyqedinrxouelf7ntkefdfuogof6rq"
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
	description = "The availability domain where resources will be created (e.g. 'LUDo:EU-FRANKFURT-1-AD-1')."
	default     = "LUDo:EU-FRANKFURT-1-AD-1"
}

variable "region" {
	type        = string
	description = "The OCI region to deploy resources in."
	default     = "eu-frankfurt-1"
}


# -----------------------------------------------------------------------
# NETWORK — Existing subnet; this module creates NO networking resources.
# -----------------------------------------------------------------------

variable "subnet_ocid" {
	type        = string
	description = <<-EOT
	OCID of the existing subnet to attach instances to.
	Networking is managed externally — this module creates no VCN, subnet,
	IGW, route table, security list, or NSG.
	Defaults to the shared pub-cmet subnet.
	EOT
	default     = "ocid1.subnet.oc1.eu-frankfurt-1.aaaaaaaa4vbr4wpapm3wpa4o73yqytsyqedinrxouelf7ntkefdfuogof6rq"
}

variable "private_ips" {
	type        = list(string)
	description = <<-EOT
	List of 3 static private IP addresses to assign to the replica nodes (one per node).
	Must be free within the existing subnet — verify in OCI Console > Networking before applying.
	Example: ["10.0.1.10", "10.0.1.11", "10.0.1.12"]
	EOT
}


# -----------------------------------------------------------------------
# VM SHAPE
# -----------------------------------------------------------------------

variable "base_image_ocid" {
	type        = string
	description = <<-EOT
	OCID of the base Ubuntu image. Used by Packer as the build source and
	by Terraform as a fallback if no Packer-built image is found.
	Defaults to Canonical Ubuntu 22.04 Minimal aarch64 in eu-frankfurt-1.
	EOT
	# Canonical-Ubuntu-22.04-Minimal-aarch64-2026.01.29-0 in eu-frankfurt-1
	default = "ocid1.image.oc1.eu-frankfurt-1.aaaaaaaaehm3rohfjplxw73gzlyhp4gy2xtym33utccjawp3b5hivi7tbvlq"
}

variable "vm_shape" {
	type        = string
	description = "The shape of the VM. Defaults to VM.Standard.A1.Flex (ARM/Ampere)."
	default     = "VM.Standard.A1.Flex"
}

variable "vm_ocpus" {
	type        = number
	description = "Number of OCPUs per replica VM."
	default     = 2
}

variable "vm_memory_in_gbs" {
	type        = number
	description = "Memory in GBs per replica VM."
	default     = 12
}

variable "boot_volume_size_in_gbs" {
	type        = number
	description = "Boot volume size in GBs."
	default     = 50
}

variable "data_volume_size_in_gbs" {
	type        = number
	description = "Dedicated data volume size in GBs per replica."
	default     = 1024
}

variable "data_volume_vpus_per_gb" {
	type        = number
	description = "VPUs per GB. 0: Lower Cost, 10: Balanced, 20: Higher Performance."
	default     = 10
}


# -----------------------------------------------------------------------
# CLICKHOUSE
# -----------------------------------------------------------------------

variable "clickhouse_http_port" {
	type        = number
	description = "ClickHouse HTTP interface port (external host port; container uses 8123 internally)."
	default     = 8123
}

variable "clickhouse_tcp_port" {
	type        = number
	description = "ClickHouse native TCP port (external host port; container uses 9000 internally)."
	default     = 9000
}

variable "clickhouse_interserver_port" {
	type        = number
	description = "ClickHouse interserver HTTP port for replication (external host port; container uses 9009 internally)."
	default     = 9009
}

variable "clickhouse_keeper_client_port" {
	type        = number
	description = "ClickHouse Keeper ZooKeeper-compatible client port. Each node runs an embedded Keeper."
	default     = 2181
}

variable "clickhouse_keeper_raft_port" {
	type        = number
	description = "ClickHouse Keeper Raft port for inter-keeper consensus between nodes."
	default     = 9444
}

variable "clickhouse_admin_password" {
	type        = string
	sensitive   = true
	description = "Password for the ClickHouse default admin user."
}
