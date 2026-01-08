# # #
# TERRAFORM VARIABLES
# Define variables for Terraform templates.

variable "module_name" {
	type = string
	description = "The component name for this module. Used for tagging and identification."
	default = "orchestrator"
}

variable "image_ocid" {
	type = string
	description = <<-EOT
	The OCID of the base image to use for the VM.
	It is recommended to use a *minimal* Ubuntu image to reduce the final image size.
	This should be regularly updated to the latest available minimal Ubuntu image.
	Current image is set to: iso-go-orchestrator-1767878542"
	EOT
	default = "ocid1.image.oc1.eu-frankfurt-1.aaaaaaaam6b4qsipyxk6wdj3meyoblfmeil6vqpdzphmljwwsjtbg4v2g52q"
}

variable "vm_shape" {
	type = string
	description = <<-EOT
	The shape of the VM to be created, i.e., the compute resources allocated to the VM machine
	that will be used to build the final image. For building lightweight images, a small shape is sufficient.
	EOT
	default = "VM.Standard.E4.Flex"
}

variable "vm_ocpus" {
	type = number
	description = <<-EOT
	The number of OCPUs to allocate to the VM used for building the image.
	It is not recommended to use less than 2 OCPUs because the machine might hang due to insufficient resources.
	The building process can be CPU intensive and is very short lived (the machine is destroyed afterwards),
	so having more resources is beneficial and not expensive.
	EOT
	default = 2
}

variable "vm_memory_in_gbs" {
	type = number
	description = <<-EOT
	The amount of memory in GBs to allocate to the VM used for building the image.
	It is not recommended to use less than 2 GBs because the machine might hang due to insufficient resources.
	The building process can be memory intensive and is very short lived (the machine is destroyed afterwards),
	so having more resources is beneficial and not expensive.
	EOT
	default = 2
}

variable "boot_volume_size_in_gbs" {
	type = number
	description = "The size of the boot volume in GBs to allocate to the VM used for building the image."
	default = 50
}

variable "instance_count" {
	type = number
	description = "The number of equal instances to create."
	default = 3
}

# Required from root
variable "project_name" { type = string }
variable "compartment_ocid" { type = string }
variable "availability_domain" { type = string }
variable "ssh_authorized_keys" { type = string }
variable "private_subnet_ocid" { type = string }
variable "private_subnet_dns_suffix" { type = string }