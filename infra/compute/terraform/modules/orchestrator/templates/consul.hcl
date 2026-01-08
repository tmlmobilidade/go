datacenter = "dc1"
data_dir = "/opt/consul/data"

bind_addr = "{{ GetPrivateIP }}"

ui = true
server = true
bootstrap_expect = ${instance_count}

retry_join = [
	%{ for i in range(instance_count) ~}
		"${project_name}-${module_name}-${i+1}.${private_subnet_dns_suffix}",
	%{ endfor ~}
]

enable_script_checks = false
disable_remote_exec = true