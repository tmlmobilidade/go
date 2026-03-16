# -----------------------------------------------------------------------
# mongodb-oci.pkr.hcl
#
# Builds a custom OCI image for MongoDB replica nodes with Docker and
# OS tuning pre-installed. MongoDB itself runs as a Docker container
# at runtime (not baked into the image) so it can be updated without
# rebuilding the image.
#
# USAGE:
#   packer init .
#   packer build --warn-on-undeclared-var .
# -----------------------------------------------------------------------


# # #
# PLUGIN
# Setup required OCI Packer plugin.

packer {
	required_plugins {
		oracle = {
			source  = "github.com/hashicorp/oracle"
			version = "~> 1"
		}
	}
}


# # #
# SOURCE
# Configure the VM that will be used
# to create the final output image.

source "oracle-oci" "mongodb-source" {

	image_name = "${var.project_name}-mongodb-{{isotime \"2000-01-01\"}}"

	instance_name = "${var.project_name}-mongodb-packer-image-builder"

	# Placement
	subnet_ocid = var.subnet_ocid
	compartment_ocid = var.compartment_ocid
	availability_domain = var.availability_domain
	ssh_username = "ubuntu"

	base_image_ocid = var.base_image_ocid

	shape = var.vm_shape

	shape_config {
		ocpus = var.vm_ocpus
		memory_in_gbs = var.vm_memory_in_gbs
	}

	create_vnic_details {
		assign_public_ip = "true"
	}

	tags = {
		"PackerBuilt" = "true"
		"ImageType"   = "mongodb-base"
		"ManagedBy"   = "packer"
	}

}


# # #
# BUILD
# Define the steps to customize the image.

build {

	sources = ["source.oracle-oci.mongodb-source"]

	# 1.
	# OS performance tuning + install prerequisite packages

	provisioner "shell" {
		script = "${path.root}/scripts/os-tuning.sh"
		execute_command = "sudo bash '{{.Path}}'"
	}

	# 2.
	# Install Docker Engine

	provisioner "shell" {
		script = "${path.root}/scripts/install-docker.sh"
		execute_command = "sudo bash '{{.Path}}'"
	}

	# 3.
	# Install runtime scripts and templates so cloud-init
	# can call them at boot. Packer file provisioners do not support
	# setting executable permissions on the files, so an additional
	# shell provisioner is used to set the correct permissions.
	# This ensures the scripts are ready to be executed by cloud-init
	# at runtime without requiring manual setup after instance launch.

	provisioner "file" {
		source = "${path.root}/scripts/attach-volume.sh"
		destination = "/usr/local/bin/attach-volume.sh"
	}

	provisioner "shell" {
		inline = ["sudo chmod +x /usr/local/bin/attach-volume.sh"]
	}


	provisioner "file" {
		source = "${path.root}/scripts/setup-mongodb.sh"
		destination = "/usr/local/bin/setup-mongodb.sh"
	}

	provisioner "shell" {
		inline = ["sudo chmod +x /usr/local/bin/setup-mongodb.sh"]
	}


	provisioner "file" {
		source = "${path.root}/scripts/init-mongodb-replica-set.sh"
		destination = "/usr/local/bin/init-mongodb-replica-set.sh"
	}

	provisioner "shell" {
		inline = ["sudo chmod +x /usr/local/bin/init-mongodb-replica-set.sh"]
	}


	provisioner "file" {
		source = "${path.root}/templates/compose.yaml"
		destination = "/usr/local/share/mongodb/compose.yaml"
	}

	provisioner "shell" {
		inline = [
			"sudo mkdir -p /usr/local/share/mongodb",
			"sudo mv /tmp/compose.yaml /usr/local/share/mongodb/compose.yaml",
		]
	}

	# 4.
	# Clean up apt cache to reduce image size

	provisioner "shell" {
		inline = [
			"sudo apt-get clean",
			# "sudo rm -rf /var/lib/apt/lists/*",
			"sudo cloud-init clean --logs",
		]
	}

	# 5.
	# Generate a manifest file with the image OCID
	# for later use in Terraform pipelines.

	post-processor "manifest" {
		output = "${path.root}/packer-manifest.json"
		strip_path = true
	}

}
