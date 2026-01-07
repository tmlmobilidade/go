# -----------------------------------------------------------------------
# NOMAD SERVER / INSTANCE CONFIGURATION
# -----------------------------------------------------------------------

resource "oci_core_instance_configuration" "this" {

	display_name = "nomad-server-config"

	compartment_id = var.compartment_ocid


	instance_details {

		instance_type = "compute"

		launch_details {

			display_name = "nomad-server"
			compartment_id = var.compartment_ocid
			availability_domain = var.availability_domain
			shape = var.vm_shape

			shape_config {
				ocpus = var.vm_ocpus
				memory_in_gbs = var.vm_memory_in_gbs
			}

			source_details {
				source_type = "image"
				image_id = var.image_ocid
				boot_volume_size_in_gbs = var.boot_volume_size_in_gbs
			}

			create_vnic_details {
				subnet_id = var.subnet_ocid
				assign_public_ip = true
			}

			agent_config {
				is_monitoring_disabled = false
				is_management_disabled = false
			}

			metadata = {
				ssh_authorized_keys = var.ssh_authorized_keys
				user_data = base64encode(file("${path.module}/cloud-init.yaml"))
			}

		}

	}

}

# -----------------------------------------------------------------------
# NOMAD SERVER / INSTANCE POOL
# -----------------------------------------------------------------------

resource "oci_core_instance_pool" "this" {

	display_name = "nomad-server-pool"
	compartment_id = var.compartment_ocid
	instance_configuration_id = oci_core_instance_configuration.this.id
	size = var.instance_count

	placement_configurations {
		availability_domain = var.availability_domain
		primary_subnet_id = var.subnet_ocid
	}

	lifecycle {
		create_before_destroy = true
	}

}