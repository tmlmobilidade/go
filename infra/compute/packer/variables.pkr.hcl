# # #
# PACKER VARIABLES
# Define variables for Packer templates.

variable "compartment_ocid" {
	type = string
	description = "The OCID of the compartment where resources will be created in.
	Current compartment is set to: cmetropolitana"
	default = "ocid1.compartment.oc1..aaaaaaaaqwnoahpbcxhsogpszdixlv4jnrnujst7qxyar6536oeptpwjtkna"
}

variable "availability_domain" {
	type = string
	description = "The availability domain where resources will be created.
	This should be the full ID string, e.g., 'LUDo:EU-FRANKFURT-1-AD-1'.
	This can only be found via the OCI CLI or by inspecting the API response
	for VM instance details on the web console."
	default = "LUDo:EU-FRANKFURT-1-AD-1"
}

variable "subnet_ocid" {
	type = string
	description = "The OCID of the subnet where the VM will be created.
	For Packer builds, this subnet must have public access to the internet,
	so it should be a public subnet. Current subnet is set to: cmet-pub"
	default = "ocid1.subnet.oc1.eu-frankfurt-1.aaaaaaaa4vbr4wpapm3wpa4o73yqytsyqedinrxouelf7ntkefdfuogof6rq"
}

variable "base_image_ocid" {
	type = string
	description = "The OCID of the base image to use for the VM.
	It is recommended to use a *minimal* Ubuntu image to reduce the final image size.
	This should be regularly updated to the latest available minimal Ubuntu image.
	Current image is set to: Canonical-Ubuntu-24.04-Minimal-2025.05.20-0"
	default = "ocid1.image.oc1.eu-frankfurt-1.aaaaaaaayqklgceyry3nejjrlffhmxbguldvgjjzznc4zworxih673gmu4aq"
}

variable "vm_shape" {
	type = string
	description = "The shape of the VM to be created, i.e., the compute resources allocated to the VM machine
	that will be used to build the final image. For building lightweight images, a small shape is sufficient."
	default = "VM.Standard.E4.Flex"
}

variable "vm_ocpus" {
	type = number
	description = "The number of OCPUs to allocate to the VM used for building the image.
	It is not recommended to use less than 2 OCPUs because the machine might hang due to insufficient resources.
	The building process can be CPU intensive and is very short lived (the machine is destroyed afterwards),
	so having more resources is beneficial and not expensive."
	default = 2
}

variable "vm_memory_in_gbs" {
	type = number
	description = "The amount of memory in GBs to allocate to the VM used for building the image.
	It is not recommended to use less than 2 GBs because the machine might hang due to insufficient resources.
	The building process can be memory intensive and is very short lived (the machine is destroyed afterwards),
	so having more resources is beneficial and not expensive."
	default = 2
}