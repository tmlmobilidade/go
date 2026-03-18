# -----------------------------------------------------------------------
# OUTPUTS
# -----------------------------------------------------------------------

output "instance_private_ips" {
	description = "Private IP addresses of the 3 ClickHouse replica instances."
	value       = oci_core_instance.clickhouse_replica[*].private_ip
}

output "clickhouse_http_urls" {
	description = "ClickHouse HTTP interface URLs (accessible from within the VCN)."
	value       = [for i in oci_core_instance.clickhouse_replica : "http://${i.private_ip}:${var.clickhouse_http_port}"]
}

output "clickhouse_tcp_dsns" {
	description = "ClickHouse native TCP endpoints (accessible from within the VCN)."
	value       = [for i in oci_core_instance.clickhouse_replica : "${i.private_ip}:${var.clickhouse_tcp_port}"]
}

output "ssh_commands" {
	description = "SSH commands to connect to each replica via a bastion/jump host."
	value       = [for i in oci_core_instance.clickhouse_replica : "ssh -J ubuntu@<bastion-ip> ubuntu@${i.private_ip}"]
}
