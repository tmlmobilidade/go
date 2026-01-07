datacenter = "dc1"
data_dir = "/opt/nomad/data"
log_level = "INFO"

bind_addr = "0.0.0.0"

consul {
	address = "127.0.0.1:8500"
	server_auto_join = true
	client_auto_join = true
	auto_advertise = true
}

advertise {
	http = "{{ GetPrivateIP }}:4646"
	rpc = "{{ GetPrivateIP }}:4647"
	serf = "{{ GetPrivateIP }}:4648"
}

client {
	enabled = true
}

plugin "docker" {
	config {
		volumes {
			enabled = true
		}
	}
}