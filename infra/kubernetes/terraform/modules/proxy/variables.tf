# # #
# TERRAFORM VARIABLES

variable "worker_node_ips" {
	type        = list(string)
	description = <<-EOT
	Private IPs of the Kubernetes worker nodes in prv-go.
	Get them after the node pool is active with:
	  kubectl get nodes -o wide
	EOT
}

variable "image_ocid" {
	type        = string
	description = <<-EOT
	The OCID of the base image to use for the proxy VM.
	Defaults to the same Ubuntu image used by the compute gateway module.
	EOT
	default     = "ocid1.image.oc1.eu-frankfurt-1.aaaaaaaack7qrrfuvvkgfwuvyhmklyvg42dq7blgbmf3fqma4xoa7ca6kdoq"
}

variable "vm_shape" {
	type        = string
	description = "The shape of the proxy VM."
	default     = "VM.Standard.E4.Flex"
}

variable "vm_ocpus" {
	type        = number
	description = "The number of OCPUs for the proxy VM."
	default     = 1
}

variable "vm_memory_in_gbs" {
	type        = number
	description = "The amount of memory in GBs for the proxy VM."
	default     = 2
}

variable "boot_volume_size_in_gbs" {
	type        = number
	description = "The size of the boot volume in GBs."
	default     = 50
}

# Required from root
variable "project_name"        { type = string }
variable "compartment_ocid"    { type = string }
variable "availability_domain" { type = string }
variable "ssh_authorized_keys" { type = string }
variable "subnet_ocid"         { type = string }
