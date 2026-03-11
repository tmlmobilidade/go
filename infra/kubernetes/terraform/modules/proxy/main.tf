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
# NGINX PROXY INSTANCE
# A single VM in pub-go that receives internet traffic and forwards it
# to the Kubernetes worker nodes via NodePort.
# -----------------------------------------------------------------------

resource "oci_core_instance" "this" {

	display_name        = "${var.project_name}-proxy"
	compartment_id      = var.compartment_ocid
	availability_domain = var.availability_domain
	shape               = var.vm_shape

	shape_config {
		ocpus         = var.vm_ocpus
		memory_in_gbs = var.vm_memory_in_gbs
	}

	source_details {
		source_type             = "image"
		source_id               = var.image_ocid
		boot_volume_size_in_gbs = var.boot_volume_size_in_gbs
	}

	create_vnic_details {
		subnet_id        = var.subnet_ocid
		assign_public_ip = true
	}

	metadata = {
		ssh_authorized_keys = var.ssh_authorized_keys
		user_data = base64encode(templatefile("${path.module}/templates/cloud-init.yaml", {
			worker_node_ips = var.worker_node_ips
			node_port       = var.node_port
		}))
	}

	freeform_tags = {
		"TerraformModule" = "proxy"
	}

}
