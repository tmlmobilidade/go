# -----------------------------------------------------------------------
# TERRAFORM SETTINGS
# -----------------------------------------------------------------------

terraform {
	required_providers {
		oci = {
			source = "oracle/oci"
		}
	}
}


# -----------------------------------------------------------------------
# WORKER / TEMPLATE FILES
# -----------------------------------------------------------------------

locals {

	consul_config = templatefile("${path.module}/templates/consul.hcl", {
		module_name = var.module_name
	})

	consul_service = templatefile("${path.module}/templates/consul.service", {})

	nomad_config = templatefile("${path.module}/templates/nomad.hcl", {})

	nomad_service = templatefile("${path.module}/templates/nomad.service", {})

}

# -----------------------------------------------------------------------
# WORKER / INSTANCE CONFIGURATION
# -----------------------------------------------------------------------

resource "oci_core_instance_configuration" "this" {

	display_name = "${var.project_name}-${var.module_name}-instance-config"
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
				assign_public_ip = false
			}

			freeform_tags = {
				"TerraformModule" = var.module_name
			}

			metadata = {
				ssh_authorized_keys = var.ssh_authorized_keys
				user_data = base64encode(file("${path.module}/templates/cloud-init.yaml"))
			}

		}

	}

}

# -----------------------------------------------------------------------
# WORKER / INSTANCE POOL
# -----------------------------------------------------------------------

resource "oci_core_instance_pool" "this" {

	display_name = "${var.project_name}-${var.module_name}-instance-pool"
	compartment_id = var.compartment_ocid
	instance_configuration_id = oci_core_instance_configuration.this.id
	size = var.instance_count

	instance_display_name_formatter = "${var.project_name}-${var.module_name}-$${launchCount}"

	placement_configurations {
		availability_domain = var.availability_domain
		primary_subnet_id = var.subnet_ocid
	}

}

# -----------------------------------------------------------------------
# WORKER / AUTOSCALING CONFIGURATION
# -----------------------------------------------------------------------

resource "oci_autoscaling_auto_scaling_configuration" "this" {

	display_name = "${var.project_name}-${var.module_name}-autoscaling-config"
	compartment_id = var.compartment_ocid
	cool_down_in_seconds = 300

	auto_scaling_resources {
		id = oci_core_instance_pool.this.id
		type = "instancePool"
	}

	policies {

		display_name = "cpu-threshold-policy"
		policy_type = "threshold"

		capacity {
			initial = var.instance_count
			min = 1
			max = 10
		}

		rules {

			display_name = "cpu-scale-out"

			metric {

				metric_type = "CPU_UTILIZATION"
				namespace = "oci_computeagent"
				resource_group = "instancePool"

				threshold {
					operator = "GT"
					value = 70
				}

			}

			action {
				type = "CHANGE_COUNT_BY"
				value = 1
			}

		}

		rules {

			display_name = "cpu-scale-in"

			metric {

				metric_type = "CPU_UTILIZATION"
				namespace = "oci_computeagent"
				resource_group = "instancePool"

				threshold {
					operator = "LT"
					value = 25
				}

			}

			action {
				type = "CHANGE_COUNT_BY"
				value = -1
			}

		}

	}

}