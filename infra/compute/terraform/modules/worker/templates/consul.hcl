datacenter = "dc1"
data_dir   = "/opt/consul/data"

bind_addr  = "{{ GetPrivateIP }}"

server = false

retry_join = [
	"${project_name}-orchestrator-1.${private_subnet_dns_suffix}",
	"${project_name}-orchestrator-2.${private_subnet_dns_suffix}",
	"${project_name}-orchestrator-3.${private_subnet_dns_suffix}",
]

enable_script_checks = false
disable_remote_exec  = true