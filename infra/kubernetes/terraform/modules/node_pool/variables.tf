# # #
# TERRAFORM VARIABLES

# Required from root
variable "project_name" { type = string }
variable "compartment_ocid" { type = string }
variable "cluster_id" { type = string }
variable "kubernetes_version" { type = string }
variable "availability_domain" { type = string }
variable "private_subnet_id" { type = string }
variable "node_shape" { type = string }
variable "node_ocpus" { type = number }
variable "node_memory_in_gbs" { type = number }
variable "node_count" { type = number }
