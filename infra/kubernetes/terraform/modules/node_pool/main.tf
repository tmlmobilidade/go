# -----------------------------------------------------------------------
# TERRAFORM SETTINGS
# -----------------------------------------------------------------------

terraform {
	required_providers {
		oci = { source = "oracle/oci" }
	}
}


# -----------------------------------------------------------------------
# DATA SOURCES
# -----------------------------------------------------------------------
# Automatically discover the correct OKE node image for the configured
# Kubernetes version. This avoids having to manually look up image OCIDs.

data "oci_containerengine_node_pool_option" "this" {
	node_pool_option_id = "all"
	compartment_id      = var.compartment_ocid
}

locals {
	# Strip the leading "v" to match the version string in image names
	# e.g. "v1.31.1" → "1.31.1"
	k8s_version_short = trimprefix(var.kubernetes_version, "v")

	# Filter for: OKE-compatible, Oracle Linux 8, x86_64 (not aarch64/ARM),
	# matching the configured Kubernetes version.
	# Image names follow the pattern: Oracle-Linux-8.X-YYYY.MM.DD-OKE-1.31.1-NNN
	node_images = [
		for s in data.oci_containerengine_node_pool_option.this.sources :
		s if(
			s.source_type == "IMAGE" &&
			can(regex("OKE-${local.k8s_version_short}", s.source_name)) &&
			can(regex("Oracle-Linux-8", s.source_name)) &&
			!can(regex("aarch64", s.source_name))
		)
	]

	# Use the last image in the filtered list (most recent build).
	node_image_id = local.node_images[length(local.node_images) - 1].image_id
}


# -----------------------------------------------------------------------
# NODE POOL
# -----------------------------------------------------------------------

resource "oci_containerengine_node_pool" "this" {

	name               = "${var.project_name}-k8s-node-pool"
	compartment_id     = var.compartment_ocid
	cluster_id         = var.cluster_id
	kubernetes_version = var.kubernetes_version

	node_shape = var.node_shape

	node_shape_config {
		ocpus         = var.node_ocpus
		memory_in_gbs = var.node_memory_in_gbs
	}

	# OKE node image resolved automatically from the data source above.
	node_source_details {
		image_id                = local.node_image_id
		source_type             = "IMAGE"
		boot_volume_size_in_gbs = 200
	}

	node_config_details {

		size = var.node_count

		placement_configs {
			availability_domain = var.availability_domain
			subnet_id           = var.private_subnet_id
		}

		node_pool_pod_network_option_details {
			cni_type = "FLANNEL_OVERLAY"
		}

	}

	node_eviction_node_pool_settings {
		eviction_grace_duration              = "PT60M"
		is_force_delete_after_grace_duration = false
	}

	freeform_tags = {
		"Project"         = var.project_name
		"TerraformModule" = "node_pool"
	}

}
