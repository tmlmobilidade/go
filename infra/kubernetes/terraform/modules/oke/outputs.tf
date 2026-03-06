# # #
# TERRAFORM OUTPUTS

output "cluster_id" {
	description = "The OCID of the OKE cluster."
	value       = oci_containerengine_cluster.this.id
}

output "cluster_endpoint" {
	description = "The private endpoint of the Kubernetes API server."
	value       = oci_containerengine_cluster.this.endpoints[0].private_endpoint
}
