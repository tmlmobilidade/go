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
# ORCHESTRATOR / TEMPLATE FILES
# -----------------------------------------------------------------------

locals {

	consul_config = templatefile("${path.module}/templates/consul.hcl", {
		project_name = var.project_name
		module_name = var.module_name
		instance_count = var.instance_count
		private_subnet_dns_suffix = var.private_subnet_dns_suffix
	})

	consul_service = templatefile("${path.module}/templates/consul.service", {})

	vault_config = templatefile("${path.module}/templates/vault.hcl", {})

	vault_service = templatefile("${path.module}/templates/vault.service", {})

	nomad_config = templatefile("${path.module}/templates/nomad.hcl", {
		instance_count = var.instance_count
	})

	nomad_service = templatefile("${path.module}/templates/nomad.service", {})

}

# -----------------------------------------------------------------------
# ORCHESTRATOR / INSTANCE CONFIGURATION
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
				subnet_id = var.private_subnet_ocid
				assign_public_ip = false
			}

			freeform_tags = {
				"TerraformModule" = var.module_name
			}

			metadata = {
				ssh_authorized_keys = var.ssh_authorized_keys
				user_data = base64encode(
					templatefile("${path.module}/templates/cloud-init.yaml", {
						nomad_config = local.nomad_config
						nomad_service = local.nomad_service
						consul_config = local.consul_config
						consul_service = local.consul_service
						vault_config = local.vault_config
						vault_service = local.vault_service
					})
				)
			}

		}

	}

}

# -----------------------------------------------------------------------
# ORCHESTRATOR / INSTANCE POOL
# -----------------------------------------------------------------------

resource "oci_core_instance_pool" "this" {

	display_name = "${var.project_name}-${var.module_name}-instance-pool"
	compartment_id = var.compartment_ocid
	instance_configuration_id = oci_core_instance_configuration.this.id
	size = var.instance_count

	instance_display_name_formatter = "${var.project_name}-${var.module_name}-$${launchCount}"

	placement_configurations {
		availability_domain = var.availability_domain
		primary_subnet_id = var.private_subnet_ocid
	}

}