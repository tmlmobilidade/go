terraform {
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = ">= 5.0.0"
    }
  }
}

provider "oci" {
  tenancy_ocid     = var.tenancy_ocid
  user_ocid        = var.user_ocid
  fingerprint      = var.fingerprint
  private_key_path = var.private_key_path
  region           = var.region
}

########################
# Nomad Server Nodes (3)
########################

resource "oci_core_instance" "nomad_server" {
  count               = 3
  compartment_id      = var.compartment_ocid
  availability_domain = var.availability_domain
  shape               = var.shape
  display_name        = "nomad-server-${count.index + 1}"

  shape_config {
    ocpus         = var.ocpus
    memory_in_gbs = var.memory_in_gbs
  }

  create_vnic_details {
    subnet_id        = var.subnet_ocid
    assign_public_ip = var.assign_public_ip
  }

  source_details {
    source_type = "image"
    source_id   = var.custom_image_ocid
  }

  metadata = {
    ssh_authorized_keys = file(var.ssh_public_key_path)
    user_data = base64encode(templatefile("cloud-init/node.yaml", {
      role       = "server"
      cluster_cidr = var.nomad_cluster_cidr
    }))
  }
}

########################
# Nomad Client Node (1)
########################

resource "oci_core_instance" "nomad_client" {
  compartment_id      = var.compartment_ocid
  availability_domain = var.availability_domain
  shape               = var.shape
  display_name        = "nomad-client"

  shape_config {
    ocpus         = var.ocpus
    memory_in_gbs = var.memory_in_gbs
  }

  create_vnic_details {
    subnet_id        = var.subnet_ocid
    assign_public_ip = var.assign_public_ip
  }

  source_details {
    source_type = "image"
    source_id   = var.custom_image_ocid
  }

  metadata = {
    ssh_authorized_keys = file(var.ssh_public_key_path)
    user_data = base64encode(templatefile("cloud-init/node.yaml", {
      role        = "client"
      cluster_cidr = var.nomad_cluster_cidr
    }))
  }
}

########################
# Outputs
########################

# output "server_private_ips" {
#   value = oci_core_instance.nomad_server.*.create_vnic_details[0].private_ip
# }

# output "client_private_ip" {
#   value = oci_core_instance.nomad_client.create_vnic_details[0].private_ip
# }