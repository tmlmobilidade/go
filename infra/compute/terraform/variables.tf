# OCI Authentication
variable "tenancy_ocid" { type = string }
variable "user_ocid" { type = string }
variable "fingerprint" { type = string }
variable "private_key_path" { type = string }
variable "region" { type = string }

# Infrastructure
variable "compartment_ocid" { type = string }
variable "availability_domain" { type = string }
variable "subnet_ocid" { type = string }
variable "ssh_public_key_path" {
  type    = string
  default = "~/.ssh/id_rsa.pub"
}

# Component Images (from Packer)
variable "server_image_ocid" { type = string }
variable "worker_image_ocid" { type = string }
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
