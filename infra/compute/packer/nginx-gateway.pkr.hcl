# # #
# SOURCE
# Configure the VM that will be used
# to create the final output image.

source "oracle-oci" "source-nginx-gateway" {

	image_name = "tml-iso-go-nginx-gateway-{{timestamp}}"

	shape = var.vm_shape
	subnet_ocid = var.subnet_ocid
	compartment_ocid = var.compartment_ocid
	availability_domain = var.availability_domain
	ssh_username = "ubuntu"

	base_image_ocid = var.base_image_ocid

	shape_config {
		ocpus = var.vm_ocpus
		memory_in_gbs = var.vm_memory_in_gbs
	}

	create_vnic_details {
		assign_public_ip = "true"
	}

}

# # #
# BUILD
# Define the steps to customize the image.

build {

	sources = ["source.oracle-oci.source-nginx-gateway"]

	provisioner "shell" {

		inline = [

			"set -eux",

			# Basic OS prep
			"sudo apt-get update",
			"sudo apt-get install -y ca-certificates curl gnupg lsb-release unattended-upgrades",

			# Enable automatic security updates
			"sudo dpkg-reconfigure -f noninteractive unattended-upgrades",

			# Docker
			"curl -fsSL https://get.docker.com | sudo sh",

		]

	}

}