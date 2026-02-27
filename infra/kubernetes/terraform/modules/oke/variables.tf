# # #
# TERRAFORM VARIABLES

# Required from root
variable "project_name" { type = string }
variable "compartment_ocid" { type = string }
variable "kubernetes_version" { type = string }
variable "vcn_id" { type = string }
variable "public_subnet_id" { type = string }
variable "private_subnet_id" { type = string }
