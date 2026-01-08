# # #
# SOURCE
# Configure the VM that will be used
# to create the final output image.

source "oracle-oci" "source-worker" {

	image_name = "${var.project_name}-worker-{{timestamp}}"

	display_name = "${var.project_name}-worker-packer-image-builder"

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

	sources = ["source.oracle-oci.source-worker"]

	provisioner "shell" {

		inline = [

			"set -eux",

			# Wait for 30 seconds to ensure
			# the machine is fully up and running
			"sleep 30",

			# Basic OS prep
			"sudo apt-get update",
			"sudo apt-get install -y ca-certificates curl gnupg lsb-release unattended-upgrades",

			# Enable automatic security updates
			"sudo dpkg-reconfigure -f noninteractive unattended-upgrades",

			# Docker
			"curl -fsSL https://get.docker.com | sudo sh",

			# HashiCorp GPG key
			"curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp.gpg",

			# HashiCorp apt repo
			"echo \"deb [signed-by=/usr/share/keyrings/hashicorp.gpg] https://apt.releases.hashicorp.com jammy main\" | sudo tee /etc/apt/sources.list.d/hashicorp.list",

			"sudo apt-get update",
			"sudo apt-get install -y nomad consul",

			# Setup required directories and permissions
			"mkdir -p /etc/consul.d",
			"chown -R consul:consul /etc/consul.d",
			"chmod 0750 /etc/consul.d",

			"mkdir -p /etc/nomad.d",
			"chown -R nomad:nomad /etc/nomad.d",
			"chmod 0750 /etc/nomad.d",

			# Disable services (start via cloud-init later)
			"sudo systemctl disable nomad",
			"sudo systemctl disable consul",

		]

	}

}