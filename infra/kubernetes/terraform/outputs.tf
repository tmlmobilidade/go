# # #
# TERRAFORM OUTPUTS
# Expose key values needed to connect kubectl and reference resources after provisioning.


output "cluster_id" {
	description = "The OCID of the OKE cluster."
	value       = module.oke.cluster_id
}

output "cluster_endpoint" {
	description = "The private endpoint of the Kubernetes API server (used by kubectl from inside the VCN)."
	value       = module.oke.cluster_endpoint
}

output "node_pool_id" {
	description = "The OCID of the node pool."
	value       = module.node_pool.node_pool_id
}

output "kubeconfig_command" {
	description = "Run this command after 'terraform apply' to configure kubectl."
	value       = <<-EOT
	oci ce cluster create-kubeconfig \
	  --cluster-id ${module.oke.cluster_id} \
	  --file $HOME/.kube/config \
	  --region ${var.region} \
	  --token-version 2.0.0 \
	  --kube-endpoint PRIVATE_ENDPOINT
	EOT
}
