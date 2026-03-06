# -----------------------------------------------------------------------
# TERRAFORM SETTINGS
# -----------------------------------------------------------------------

terraform {
	required_providers {
		oci = { source = "oracle/oci" }
	}
}


# -----------------------------------------------------------------------
# OKE CLUSTER
# -----------------------------------------------------------------------

resource "oci_containerengine_cluster" "this" {

	name               = "${var.project_name}-k8s-cluster"
	compartment_id     = var.compartment_ocid
	kubernetes_version = var.kubernetes_version
	vcn_id             = var.vcn_id


	# Kubernetes API endpoint — placed in the private subnet (no public IP).
	# The public subnet's security list does not have port 6443 open.
	# Access kubectl via VPN or a bastion host inside the VCN.
	# To expose publicly later, ask the networking team to allow TCP 6443 inbound
	# on the public subnet and switch is_public_ip_enabled to true.
	endpoint_config {
		is_public_ip_enabled = false
		subnet_id            = var.private_subnet_id
	}


	# OCI Load Balancers created by Kubernetes Services (type: LoadBalancer)
	# will be provisioned into the public subnet automatically.
	options {
		service_lb_subnet_ids = [var.public_subnet_id]

		# Pod and service CIDR ranges must not overlap with the VCN CIDR (10.0.0.0/16).
		kubernetes_network_config {
			pods_cidr     = "10.244.0.0/16" # Flannel default pod CIDR
			services_cidr = "10.96.0.0/16"  # Kubernetes service CIDR
		}
	}


	# CNI: Flannel Overlay — uses VXLAN tunnels to provide pod networking.
	# Simpler to set up than OCI VCN-native networking.
	# For production, consider migrating to OCI_VCN_IP_NATIVE, which gives pods
	# real VCN IPs for better performance, observability, and security group support.
	cluster_pod_network_options {
		cni_type = "FLANNEL_OVERLAY"
	}


	freeform_tags = {
		"Project"         = var.project_name
		"TerraformModule" = "oke"
	}

}
