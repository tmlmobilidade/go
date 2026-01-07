datacenter = "dc1"
data_dir   = "/opt/consul/data"

bind_addr  = "{{ GetPrivateIP }}"

server = false

retry_join = [
	# Consul automatically discovers other servers via OCI tags
	# using instance principals authentication. The "ListInstances"
	# policy must be attached to the instance principal dynamic group.
	"provider=oci tag_key=TerraformModule tag_value=${module_name}"
]

enable_script_checks = false
disable_remote_exec  = true