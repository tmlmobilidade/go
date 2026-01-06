########################
# Variables
########################

variable "tenancy_ocid" {}
variable "user_ocid" {}
variable "fingerprint" {}
variable "private_key_path" {}
variable "region" {}

variable "compartment_ocid" {}
variable "availability_domain" {}

variable "subnet_ocid" {}
variable "custom_image_ocid" {}

variable "ssh_public_key_path" {}

variable "shape" {
  default = "VM.Standard.E4.Flex"
}

variable "ocpus" {
  default = 2
}

variable "memory_in_gbs" {
  default = 4
}

variable "display_name" {
  default = "nomad-node"
}

variable "assign_public_ip" {
  default = true
}

# The subnet CIDR for cluster discovery
variable "nomad_cluster_cidr" {
  default = "10.0.1.0/24"
}