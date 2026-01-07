# Nomad Server - Instance Configuration + Pool

resource "oci_core_instance_configuration" "this" {
  compartment_id = var.compartment_ocid
  display_name   = "nomad-server-config"
  freeform_tags  = var.freeform_tags

  instance_details {
    instance_type = "compute"

    launch_details {
      compartment_id      = var.compartment_ocid
      display_name        = "nomad-server"
      availability_domain = var.availability_domain
      shape               = "VM.Standard.E4.Flex"

      shape_config {
        ocpus         = 2
        memory_in_gbs = 8
      }

      source_details {
        source_type             = "image"
        image_id                = var.image_ocid
        boot_volume_size_in_gbs = 50
      }

      create_vnic_details {
        subnet_id        = var.subnet_ocid
        assign_public_ip = true
        display_name     = "nomad-server-vnic"
      }

      metadata = {
        ssh_authorized_keys = var.ssh_authorized_keys
        user_data           = base64encode(file("${path.module}/cloud-init.yaml"))
      }

      agent_config {
        is_monitoring_disabled = false
        is_management_disabled = false
      }

      freeform_tags = var.freeform_tags
    }
  }
}

resource "oci_core_instance_pool" "this" {
  compartment_id            = var.compartment_ocid
  display_name              = "nomad-server-pool"
  instance_configuration_id = oci_core_instance_configuration.this.id
  size                      = var.instance_count
  freeform_tags             = var.freeform_tags

  placement_configurations {
    availability_domain = var.availability_domain
    primary_subnet_id   = var.subnet_ocid
  }

  lifecycle {
    create_before_destroy = true
  }
}