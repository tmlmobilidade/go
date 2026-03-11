# # #
# TERRAFORM VARIABLES
# All inputs for the Kubernetes (OKE) infrastructure.
#
# Networking resources (VCN, subnets, gateways) are managed by a
# separate team — provide their OCIDs via terraform.tfvars.


# -----------------------------------------------------------------------
# PROJECT SETTINGS
# -----------------------------------------------------------------------

variable "project_name" {
	type        = string
	description = "The name of the project. Used as a prefix for resource names and tags."
	default     = "iso-go"
}


# -----------------------------------------------------------------------
# OCI AUTHENTICATION VARIABLES
# -----------------------------------------------------------------------

variable "tenancy_ocid" {
	type        = string
	description = "The OCID of the Oracle Cloud Infrastructure tenancy."
}

variable "user_ocid" {
	type        = string
	description = "The OCID of the Oracle Cloud Infrastructure user."
}

variable "fingerprint" {
	type        = string
	description = "The fingerprint of the API key."
}

variable "private_key_path" {
	type        = string
	description = "The file path to the private key for OCI API authentication."
}

variable "region" {
	type        = string
	description = "The OCI region to deploy into."
	default     = "eu-frankfurt-1"
}


# -----------------------------------------------------------------------
# COMPARTMENT / PLACEMENT
# -----------------------------------------------------------------------

variable "compartment_ocid" {
	type        = string
	description = <<-EOT
	The OCID of the compartment where all resources will be created.
	Current compartment is set to: GO-stg
	EOT
	default     = "ocid1.compartment.oc1..aaaaaaaanljo4qhg4wnwjpul5seazrticeyswmx5zt7f64ekfewpr6y6mbva"
}

variable "availability_domain" {
	type        = string
	description = <<-EOT
	The availability domain where worker nodes will be placed.
	Full ID string, e.g. 'LUDo:EU-FRANKFURT-1-AD-1'.
	EOT
	default     = "LUDo:EU-FRANKFURT-1-AD-1"
}


# -----------------------------------------------------------------------
# EXISTING NETWORKING
# These resources are managed by a separate team and must already exist.
# Obtain the OCIDs from the OCI Console or from the networking team.
# -----------------------------------------------------------------------

variable "vcn_id" {
	type        = string
	description = <<-EOT
	The OCID of the existing VCN to deploy the OKE cluster into.
	Managed by the networking team — do not create or modify.
	EOT
}

variable "public_subnet_id" {
	type        = string
	description = <<-EOT
	The OCID of an existing public subnet for the Kubernetes API endpoint
	and OCI Load Balancers (Kubernetes Services of type LoadBalancer / Ingress).
	Managed by the networking team — do not create or modify.
	EOT
}

variable "private_subnet_id" {
	type        = string
	description = <<-EOT
	The OCID of an existing private subnet for the OKE worker nodes.
	Nodes in this subnet have no public IPs; they reach the internet via NAT gateway.
	Managed by the networking team — do not create or modify.
	EOT
}


# -----------------------------------------------------------------------
# KUBERNETES CLUSTER
# -----------------------------------------------------------------------

variable "kubernetes_version" {
	type        = string
	description = <<-EOT
	The version of Kubernetes for the OKE cluster and node pool.
	Must be one of the versions currently supported by OKE.
	To list valid versions:
	  oci ce cluster-options get --cluster-option-id all --query 'data.kubernetesVersions'
	EOT
	default     = "v1.31.1"
}


# -----------------------------------------------------------------------
# NODE POOL
# -----------------------------------------------------------------------

variable "node_shape" {
	type        = string
	description = "The shape of the worker nodes. Flex shapes allow configuring OCPU and memory independently."
	default     = "VM.Standard.E4.Flex"
}

variable "node_ocpus" {
	type        = number
	description = "The number of OCPUs for each worker node."
	default     = 2
}

variable "node_memory_in_gbs" {
	type        = number
	description = "The amount of memory in GBs for each worker node."
	default     = 8
}

variable "node_count" {
	type        = number
	description = "The number of worker nodes in the node pool. Set to 1 for the PoC; increase for production."
	default     = 1
}


# -----------------------------------------------------------------------
# PROXY VM
# -----------------------------------------------------------------------

variable "ssh_public_key_path" {
	type        = string
	description = "The file path to the SSH public key for proxy VM access."
}

variable "worker_node_ips" {
	type        = list(string)
	description = <<-EOT
	Private IPs of the Kubernetes worker nodes in prv-go.
	Obtain after the node pool is active with:
	  kubectl get nodes -o wide
	EOT
}

