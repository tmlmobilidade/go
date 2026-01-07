# # #
# OCI Authentication Variables

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
	description = "The file path to the private key for API authentication."
}

variable "region" {
	type = string
	description = "The Oracle Cloud Infrastructure region."
}

# # #
# Compute Instance Configuration

variable "compartment_ocid" {
	type = string
}
variable "availability_domain" {
	type = string
}
variable "subnet_ocid" {
	type = string
}
variable "ssh_public_key_path" {
  type    = string
  default = "~/.ssh/id_rsa.pub"
}

# Component Images (from Packer)
variable "server_image_ocid" {
	type = string
}
variable "worker_image_ocid" {
	type = string
}
variable "gateway_image_ocid" {
  type    = string
  default = ""
}

# Instance Counts
variable "server_count" {
  type    = number
  default = 3
}
variable "worker_count" {
  type    = number
  default = 3
}
variable "gateway_count" {
  type    = number
  default = 2
}
variable "deploy_gateway" {
  type    = bool
  default = false
}
