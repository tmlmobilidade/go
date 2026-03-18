# # #
# PROJECT VARIABLES

variable "project_name" {
	type = string
	description = "The name of the project. Used as a prefix for resource names and tags."
	default = "iso-go"
}

variable "module_name" {
	type = string
	description = "The component name for this module. Used for tagging and identification."
	default = "mongodb"
}

variable "instance_count" {
	type = number
	description = "Number of MongoDB replica nodes to provision."
	default = 3
}


# # #
# OCI AUTHENTICATION

variable "tenancy_ocid" {
	type = string
	description = "The OCID of the Oracle Cloud Infrastructure tenancy."
}

variable "user_ocid" {
	type = string
	description = "The OCID of the OCI user (e.g. tiago.macedo) used for API authentication."
}

variable "fingerprint" {
	type = string
	description = "The fingerprint of the API key."
}

variable "private_key_path" {
	type = string
	description = "The file path to the private key for OCI API authentication."
}

variable "ssh_authorized_keys_path" {
	type = string
	description = "The file path to the SSH authorized keys to allow instance access."
}


# # #
# OCI PLACEMENT

variable "compartment_ocid" {
	type = string
	description = <<-EOT
	The OCID of the compartment where resources will be created in.
	Current compartment is set to: cmet
	EOT
}

variable "availability_domain" {
	type = string
	description = "The availability domain where resources will be created (e.g. 'LUDo:EU-FRANKFURT-1-AD-1')."
	default = "LUDo:EU-FRANKFURT-1-AD-1"
}

variable "region" {
	type = string
	description = "The OCI region to deploy resources in."
	default = "eu-frankfurt-1"
}


# # #
# NETWORKING

variable "subnet_ocid" {
	type = string
	description = <<-EOT
	OCID of the existing subnet to attach instances to.
	Networking is managed externally — this module creates no VCN, subnet,
	IGW, route table, security list, or NSG.
	Defaults to the shared pub-cmet subnet.
	EOT
}

variable "private_ips" {
	type = list(string)
	description = <<-EOT
	List of 3 static private IP addresses to assign to the replica nodes (one per node).
	Must be free within the existing subnet — verify in OCI Console > Networking before applying.
	Example: ["10.0.1.20", "10.0.1.21", "10.0.1.22"]
	EOT
}


# # #
# VM SHAPE

variable "base_image_ocid" {
	type = string
	description = "OCID of the Packer-built image."
	default = "ocid1.image.oc1.eu-frankfurt-1.aaaaaaaa6p7e6rdkutefe3devm7eqx66wwyz4dpniu3hrqawmqfd3umltk6a"
}

variable "vm_shape" {
	type = string
	description = "The shape of the VM."
	default = "VM.Standard.A1.Flex"
}

variable "vm_ocpus" {
	type = number
	description = "Number of OCPUs per replica VM."
	default = 2
}

variable "vm_memory_in_gbs" {
	type = number
	description = "Memory in GBs per replica VM."
	default = 12
}

variable "boot_volume_size_in_gbs" {
	type = number
	description = "Boot volume size in GBs."
	default = 50
}


# # #
# STORAGE

variable "block_volume_ocids" {
	type = list(string)
	description = <<-EOT
	List of OCIDs for existing block volumes to attach as data disks to the replica nodes.
	Each volume must be pre-created and match the count of replica nodes.
	Example: ["10.0.1.20", "10.0.1.21", "10.0.1.22"]
	EOT
}


# # #
# MONGODB

variable "replica_set_name" {
	type = string
	description = "MongoDB replica set name. All 3 nodes must use the same name."
	default = "rs0"
}

variable "mongodb_port" {
	type = number
	description = "MongoDB listening port."
	default = 27017
}

variable "mongodb_root_username" {
	type = string
	description = "MongoDB root username."
	default = "admin"
}

variable "mongodb_root_password" {
	type = string
	sensitive = true
	description = "MongoDB root password."
}

variable "mongodb_keyfile" {
	type = string
	sensitive = true
	description = <<-EOT
	Shared keyfile content for MongoDB replica set internal authentication.
	All nodes must use the same keyfile. Generate once with: `openssl rand -base64 756`
	Then paste the output (including newlines) as the value of this variable.
	EOT
}
