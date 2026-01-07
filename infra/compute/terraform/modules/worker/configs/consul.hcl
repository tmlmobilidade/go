datacenter = "dc1"
data_dir   = "/opt/consul/data"

bind_addr  = "{{ GetPrivateIP }}"

retry_join = [
  "10.81.100.114",
#   "10.0.0.11",
#   "10.0.0.12"
]

enable_script_checks = false
disable_remote_exec  = true