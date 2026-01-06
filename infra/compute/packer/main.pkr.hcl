packer {
  required_plugins {
    oracle = {
      source  = "github.com/hashicorp/oracle"
      version = "~> 1"
    }
  }
}

source "oracle-oci" "test-image" {

	availability_domain = "LUDo:EU-FRANKFURT-1-AD-1"
	base_image_ocid = "ocid1.image.oc1.eu-frankfurt-1.aaaaaaaayqklgceyry3nejjrlffhmxbguldvgjjzznc4zworxih673gmu4aq"
	compartment_ocid = var.compartment_ocid
	image_name = "packer-test-image"
	shape = "VM.Standard.E4.Flex"
	ssh_username = "ubuntu"
	subnet_ocid = var.subnet_ocid

	shape_config {
		ocpus = 1
		memory_in_gbs = 1
	}

	use_private_ip = "false"

	create_vnic_details {
		assign_public_ip = "true"
		# display_name = "testing-123"
		# nsg_ids = ["ocid1.networksecuritygroup.oc1.iad.aaa"]
	}

}

build {
  sources = ["source.oracle-oci.test-image"]

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

      # HashiCorp GPG key
      "curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp.gpg",

      # HashiCorp apt repo
      "echo \"deb [signed-by=/usr/share/keyrings/hashicorp.gpg] https://apt.releases.hashicorp.com jammy main\" | sudo tee /etc/apt/sources.list.d/hashicorp.list",

      "sudo apt-get update",
      "sudo apt-get install -y nomad consul vault",

      # Disable services (start via cloud-init later)
      "sudo systemctl disable nomad",
      "sudo systemctl disable consul",
      "sudo systemctl disable vault"
    ]
  }

}