# -----------------------------------------------------------------------
# TERRAFORM SETTINGS
# -----------------------------------------------------------------------

terraform {
	required_providers {
		oci = {
			source  = "oracle/oci"
			version = "~> 7.0"
		}
	}
}


# -----------------------------------------------------------------------
# OCI AUTHENTICATION
# (Defined in variables.tf — values come from terraform.tfvars)
# -----------------------------------------------------------------------

provider "oci" {
	tenancy_ocid     = var.tenancy_ocid
	user_ocid        = var.user_ocid
	fingerprint      = var.fingerprint
	private_key_path = var.private_key_path
	region           = var.region
}


# -----------------------------------------------------------------------
# LOCALS
# -----------------------------------------------------------------------

locals {
	ssh_keys    = file(var.ssh_public_key_path)
	name_prefix = "${var.project_name}-${var.module_name}"

	# Resolved from the Packer-built image data source — falls back to base image if not found
	resolved_image_ocid = length(data.oci_core_images.clickhouse_replica_base.images) > 0 ? data.oci_core_images.clickhouse_replica_base.images[0].id : var.base_image_ocid
}


# -----------------------------------------------------------------------
# DATA SOURCE — Packer-built ClickHouse Replica base image
# Automatically discovers the latest image produced by Packer.
# Run `packer build` in the packer/ directory to create/update this image.
# -----------------------------------------------------------------------

data "oci_core_images" "clickhouse_replica_base" {
	compartment_id = var.compartment_ocid

	filter {
		name   = "display_name"
		values = ["clickhouse-replica-base-.*"]
		regex  = true
	}

	filter {
		name   = "state"
		values = ["AVAILABLE"]
	}

	sort_by    = "TIMECREATED"
	sort_order = "DESC"
}


# -----------------------------------------------------------------------
# COMPUTE — ClickHouse Replica VMs
#
# This module creates NO networking resources.
# Instances attach directly to the existing subnet (var.subnet_ocid).
# All firewall rules are managed by the networking team via the existing
# Security List — this module adds nothing to it.
# -----------------------------------------------------------------------

resource "oci_core_instance" "clickhouse_replica" {
	count = var.instance_count

	display_name        = "${local.name_prefix}-${count.index + 1}"
	compartment_id      = var.compartment_ocid
	availability_domain = var.availability_domain
	shape               = var.vm_shape

	shape_config {
		ocpus         = var.vm_ocpus
		memory_in_gbs = var.vm_memory_in_gbs
	}

	source_details {
		source_type             = "image"
		source_id               = local.resolved_image_ocid
		boot_volume_size_in_gbs = var.boot_volume_size_in_gbs
	}

	create_vnic_details {
		subnet_id        = var.subnet_ocid
		private_ip       = var.private_ips[count.index]
		assign_public_ip = false
		display_name     = "${local.name_prefix}-${count.index + 1}-vnic"
	}

	agent_config {
		is_monitoring_disabled = false
		is_management_disabled = false
		plugins_config {
			desired_state = "ENABLED"
			name          = "Bastion"
		}
	}

	metadata = {
		ssh_authorized_keys = local.ssh_keys

		# cloud-init runs on first boot and configures ClickHouse Keeper + replication.
		# All node IPs are known at plan time (static assignment) so they are injected here.
		user_data = base64encode(templatefile("${path.module}/templates/cloud-init.yaml", {
			node_index                    = count.index
			all_private_ips               = var.private_ips
			clickhouse_admin_password     = var.clickhouse_admin_password
			clickhouse_http_port          = var.clickhouse_http_port
			clickhouse_tcp_port           = var.clickhouse_tcp_port
			clickhouse_interserver_port   = var.clickhouse_interserver_port
			clickhouse_keeper_client_port = var.clickhouse_keeper_client_port
			clickhouse_keeper_raft_port   = var.clickhouse_keeper_raft_port
		}))
	}

	freeform_tags = {
		"TerraformModule" = var.module_name
		"ManagedBy"       = "terraform"
		"ReplicaIndex"    = tostring(count.index + 1)
	}

	# Prevent accidental replacement of the database VM
	lifecycle {
		ignore_changes = [
			source_details,
		]
	}
}


# -----------------------------------------------------------------------
# STORAGE — Dedicated Block Volumes (one 1TB volume per replica node)
# -----------------------------------------------------------------------

resource "oci_core_volume" "clickhouse_replica_data" {
	count = var.instance_count

	display_name        = "${local.name_prefix}-${count.index + 1}-data-vol"
	compartment_id      = var.compartment_ocid
	availability_domain = var.availability_domain
	size_in_gbs         = var.data_volume_size_in_gbs
	vpus_per_gb         = var.data_volume_vpus_per_gb

	freeform_tags = {
		"TerraformModule" = var.module_name
		"ManagedBy"       = "terraform"
		"ReplicaIndex"    = tostring(count.index + 1)
	}
}

resource "oci_core_volume_attachment" "clickhouse_replica_data" {
	count = var.instance_count

	attachment_type = "paravirtualized"
	instance_id     = oci_core_instance.clickhouse_replica[count.index].id
	volume_id       = oci_core_volume.clickhouse_replica_data[count.index].id
	display_name    = "${local.name_prefix}-${count.index + 1}-data-attachment"

	# Paravirtualized is easier to manage in cloud-init than iSCSI
	is_pv_encryption_in_transit_enabled = false
}
