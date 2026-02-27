# # #
# TERRAFORM OUTPUTS

output "node_pool_id" {
	description = "The OCID of the node pool."
	value       = oci_containerengine_node_pool.this.id
}
