# -----------------------------------------------------------------------
# clickhouse-replica-oci.pkr.hcl
#
# Builds a custom OCI image for ClickHouse Replica nodes with Docker and
# OS tuning pre-installed. The resulting image is used by Terraform in
# place of the raw Ubuntu base image, speeding up instance boot.
#
# USAGE:
#   packer init .
#   cp ../terraform/terraform.tfvars ../terraform/terraform.pkrvars.hcl   # Packer requires .hcl extension
#   packer build -var-file=../terraform/terraform.pkrvars.hcl -warn-on-undeclared-var .
# -----------------------------------------------------------------------

packer {
  required_plugins {
    oracle = {
      source  = "github.com/hashicorp/oracle"
      version = "~> 1.0"
    }
  }
}


# -----------------------------------------------------------------------
# SOURCE — OCI builder
# Creates a temporary instance, runs provisioners, then captures an image.
# -----------------------------------------------------------------------

source "oracle-oci" "clickhouse_replica_base" {
  # Authentication
  tenancy_ocid = var.tenancy_ocid
  user_ocid    = var.user_ocid
  fingerprint  = var.fingerprint
  key_file     = var.private_key_path
  region       = var.region

  # Placement
  compartment_ocid    = var.compartment_ocid
  availability_domain = var.availability_domain
  subnet_ocid         = var.packer_subnet_ocid

  # Temporary build instance settings (ARM)
  shape = "VM.Standard.A1.Flex"
  shape_config {
    ocpus         = 2
    memory_in_gbs = 12
  }

  # Base image
  base_image_ocid = var.base_image_ocid

  # Inject the SSH public key so Packer can connect
  metadata = {
    "ssh_authorized_keys" = file(var.ssh_public_key_path)
  }

  ssh_username         = "ubuntu"
  ssh_private_key_file = var.ssh_private_key_path

  # Output image name — datestamped for traceability
  image_name = "clickhouse-replica-base-{{isotime \"2006-01-02\"}}"

  tags = {
    "PackerBuilt" = "true"
    "ImageType"   = "clickhouse-replica-base"
    "ManagedBy"   = "packer"
  }
}


# -----------------------------------------------------------------------
# BUILD — Run provisioner scripts inside the temporary instance
# -----------------------------------------------------------------------

build {
  name    = "clickhouse-replica-base"
  sources = ["source.oracle-oci.clickhouse_replica_base"]

  # 1. OS performance tuning + install prerequisite packages
  provisioner "shell" {
    script          = "${path.root}/scripts/os-tuning.sh"
    execute_command = "sudo bash '{{.Path}}'"
  }

  # 2. Install Docker Engine
  provisioner "shell" {
    script          = "${path.root}/scripts/install-docker.sh"
    execute_command = "sudo bash '{{.Path}}'"
  }

  # 3. Install runtime scripts and templates so cloud-init can call them at boot
  provisioner "file" {
    source      = "${path.root}/scripts/attach-volume.sh"
    destination = "/tmp/attach-volume.sh"
  }

  provisioner "file" {
    source      = "${path.root}/scripts/setup-clickhouse.sh"
    destination = "/tmp/setup-clickhouse.sh"
  }

  provisioner "file" {
    source      = "${path.root}/templates/compose.yaml"
    destination = "/tmp/compose.yaml"
  }

  provisioner "shell" {
    inline = [
      "sudo mv /tmp/attach-volume.sh /usr/local/bin/attach-volume.sh",
      "sudo chmod +x /usr/local/bin/attach-volume.sh",
      "sudo mv /tmp/setup-clickhouse.sh /usr/local/bin/setup-clickhouse.sh",
      "sudo chmod +x /usr/local/bin/setup-clickhouse.sh",
      "sudo mkdir -p /usr/local/share/clickhouse",
      "sudo mv /tmp/compose.yaml /usr/local/share/clickhouse/compose.yaml",
    ]
  }

  # 4. Pre-pull the ClickHouse Docker image
  #    Instances in the private subnet have no internet access at runtime.
  #    Pulling here (during Packer build on the public subnet) bakes the
  #    image into the base OS image so cloud-init just runs it.
  provisioner "shell" {
    inline = [
      "sudo docker pull clickhouse/clickhouse-server:latest",
    ]
  }

  # 5. Clean up apt cache to reduce image size
  provisioner "shell" {
    inline = [
      "sudo apt-get clean",
      "sudo rm -rf /var/lib/apt/lists/*",
      "sudo cloud-init clean --logs",
    ]
  }

  post-processor "manifest" {
    output     = "${path.root}/packer-manifest.json"
    strip_path = true
  }
}
