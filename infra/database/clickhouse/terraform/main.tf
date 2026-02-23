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
# OCI AUTHENTICATION VARIABLES
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
	ssh_keys = file(var.ssh_public_key_path)

	# Render cloud-init with ClickHouse-specific values
	cloud_init = templatefile("${path.module}/templates/cloud-init.yaml", {
		clickhouse_admin_password = var.clickhouse_admin_password
		clickhouse_http_port      = var.clickhouse_http_port
		clickhouse_tcp_port       = var.clickhouse_tcp_port
	})

	name_prefix = "${var.project_name}-${var.module_name}"
}


# -----------------------------------------------------------------------
# NETWORKING — Dedicated, isolated VCN for ClickHouse
# -----------------------------------------------------------------------

resource "oci_core_vcn" "clickhouse" {
	display_name   = "${local.name_prefix}-vcn"
	compartment_id = var.compartment_ocid
	cidr_blocks    = [var.vcn_cidr]
	dns_label      = "clickhouse"

	freeform_tags = {
		"TerraformModule" = var.module_name
		"ManagedBy"       = "terraform"
	}
}

# Internet Gateway — allows outbound internet and inbound public connections
resource "oci_core_internet_gateway" "clickhouse" {
	display_name   = "${local.name_prefix}-igw"
	compartment_id = var.compartment_ocid
	vcn_id         = oci_core_vcn.clickhouse.id
	enabled        = true

	freeform_tags = {
		"TerraformModule" = var.module_name
	}
}

# Route Table — default route through the internet gateway
resource "oci_core_route_table" "clickhouse" {
	display_name   = "${local.name_prefix}-rt"
	compartment_id = var.compartment_ocid
	vcn_id         = oci_core_vcn.clickhouse.id

	route_rules {
		network_entity_id = oci_core_internet_gateway.clickhouse.id
		destination       = "0.0.0.0/0"
		destination_type  = "CIDR_BLOCK"
	}

	freeform_tags = {
		"TerraformModule" = var.module_name
	}
}

# Security List — controls traffic to/from the ClickHouse instance
resource "oci_core_security_list" "clickhouse" {
	display_name   = "${local.name_prefix}-sl"
	compartment_id = var.compartment_ocid
	vcn_id         = oci_core_vcn.clickhouse.id

	# Allow all outbound traffic
	egress_security_rules {
		protocol    = "all"
		destination = "0.0.0.0/0"
		stateless   = false
	}

	# Allow inbound SSH (port 22)
	dynamic "ingress_security_rules" {
		for_each = var.allowed_ingress_cidrs
		content {
			protocol  = "6" # TCP
			source    = ingress_security_rules.value
			stateless = false

			tcp_options {
				min = 22
				max = 22
			}
		}
	}

	# Allow inbound ClickHouse HTTP interface (default: 8123)
	# Only added when ssh_tunnel_only = false — otherwise the port is invisible publicly.
	dynamic "ingress_security_rules" {
		for_each = var.ssh_tunnel_only ? [] : var.allowed_ingress_cidrs
		content {
			protocol  = "6" # TCP
			source    = ingress_security_rules.value
			stateless = false

			tcp_options {
				min = var.clickhouse_http_port
				max = var.clickhouse_http_port
			}
		}
	}

	# Allow inbound ClickHouse native TCP interface (default: 9000)
	# Only added when ssh_tunnel_only = false.
	dynamic "ingress_security_rules" {
		for_each = var.ssh_tunnel_only ? [] : var.allowed_ingress_cidrs
		content {
			protocol  = "6" # TCP
			source    = ingress_security_rules.value
			stateless = false

			tcp_options {
				min = var.clickhouse_tcp_port
				max = var.clickhouse_tcp_port
			}
		}
	}

	freeform_tags = {
		"TerraformModule" = var.module_name
	}
}

# Public Subnet — the instance will get a public IP here
resource "oci_core_subnet" "clickhouse" {
	display_name               = "${local.name_prefix}-subnet"
	compartment_id             = var.compartment_ocid
	vcn_id                     = oci_core_vcn.clickhouse.id
	cidr_block                 = var.subnet_cidr
	route_table_id             = oci_core_route_table.clickhouse.id
	security_list_ids          = [oci_core_security_list.clickhouse.id]
	dns_label                  = "clickhouse"
	prohibit_public_ip_on_vnic = false

	freeform_tags = {
		"TerraformModule" = var.module_name
	}
}


# -----------------------------------------------------------------------
# COMPUTE — ClickHouse VM
# -----------------------------------------------------------------------

resource "oci_core_instance" "clickhouse" {
	display_name        = "${local.name_prefix}-instance"
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
		subnet_id        = oci_core_subnet.clickhouse.id
		assign_public_ip = true
		display_name     = "${local.name_prefix}-vnic"
		hostname_label   = var.module_name
	}

	agent_config {
		is_monitoring_disabled = false
		is_management_disabled = false
	}

	metadata = {
		ssh_authorized_keys = local.ssh_keys
		# cloud-init runs on first boot: installs Docker, writes compose.yml, starts ClickHouse
		user_data = base64encode(local.cloud_init)
	}

	freeform_tags = {
		"TerraformModule" = var.module_name
		"ManagedBy"       = "terraform"
	}

	# Prevent accidental replacement of the database VM
	lifecycle {
		ignore_changes = [
			# Image OCIDs change on updates; only apply intentionally
			source_details,
		]
	}
}
