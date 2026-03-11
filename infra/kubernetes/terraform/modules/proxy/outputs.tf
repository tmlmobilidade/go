output "public_ip" {
	description = "Public IP of the nginx proxy VM. Use this for DNS records and security list rules."
	value       = oci_core_instance.this.public_ip
}
