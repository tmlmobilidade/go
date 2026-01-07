# -----------------------------------------------------------------------
# WORKER / TEMPLATE FILES
# -----------------------------------------------------------------------

locals {

	consul_config = templatefile("${path.module}/templates/consul.hcl", {
		module_name = var.module_name
	})

	consul_service = templatefile("${path.module}/templates/consul.service", {})

	nomad_config = templatefile("${path.module}/templates/nomad.hcl", {
		instance_count = var.instance_count
	})

	nomad_service = templatefile("${path.module}/templates/nomad.service", {})

}

# -----------------------------------------------------------------------
# WORKER / INSTANCE CONFIGURATION
# -----------------------------------------------------------------------

resource "oci_core_instance_configuration" "this" {

	display_name = "${var.module_name}-instance-config"
	compartment_id = var.compartment_ocid

	instance_details {

		instance_type = "compute"

		launch_details {

			display_name = var.module_name
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

			freeform_tags = {
				"TerraformModule" = var.module_name
			}

			metadata = {
				ssh_authorized_keys = var.ssh_authorized_keys
				user_data = base64encode(file("${path.module}/cloud-init.yaml"))
			}

		}

	}

}

# -----------------------------------------------------------------------
# WORKER / INSTANCE POOL
# -----------------------------------------------------------------------

resource "oci_core_instance_pool" "this" {

	display_name = "${var.module_name}-instance-pool"
	compartment_id = var.compartment_ocid
	instance_configuration_id = oci_core_instance_configuration.this.id
	size = var.instance_count

	instance_display_name_formatter = "${var.module_name}-{{count}}"

	placement_configurations {
		availability_domain = var.availability_domain
		primary_subnet_id = var.subnet_ocid
	}

}

# -----------------------------------------------------------------------
# NGINX GATEWAY / AUTOSCALING CONFIGURATION
# -----------------------------------------------------------------------

resource "oci_autoscaling_configuration" "this" {

	display_name = "${var.module_name}-autoscaling-config"
	compartment_id = var.compartment_ocid

	resource {
		type = "instancePool"
		id = oci_core_instance_pool.this.id
	}

	policies {

		policy_type = "threshold"

		rules {

			metric_name = "CpuUtilization"
			threshold = 70
			operator = "GT"

			action {
				type = "CHANGE_COUNT_BY"
				value = 1
			}

		}

	}

}