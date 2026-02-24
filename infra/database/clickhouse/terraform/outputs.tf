# -----------------------------------------------------------------------
# OUTPUTS
# -----------------------------------------------------------------------

output "instance_public_ip" {
	description = "The public IP address of the ClickHouse instance."
	value       = oci_core_instance.clickhouse.public_ip
}

output "instance_private_ip" {
	description = "The private IP address of the ClickHouse instance."
	value       = oci_core_instance.clickhouse.private_ip
}

output "clickhouse_http_url" {
	description = "ClickHouse HTTP interface URL."
	value       = "http://${oci_core_instance.clickhouse.public_ip}:${var.clickhouse_http_port}"
}

output "clickhouse_tcp_dsn" {
	description = "ClickHouse native TCP connection string (clickhouse-client --host ... --port ...)."
	value       = "${oci_core_instance.clickhouse.public_ip}:${var.clickhouse_tcp_port}"
}

output "ssh_command" {
	description = "Command to SSH into the ClickHouse instance."
	value       = "ssh ubuntu@${oci_core_instance.clickhouse.public_ip}"
}
