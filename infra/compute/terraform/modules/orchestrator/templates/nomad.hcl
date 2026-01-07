datacenter = "dc1"
data_dir = "/opt/nomad/data"
log_level = "INFO"

bind_addr = "0.0.0.0"

advertise {
	http = "{{ GetPrivateIP }}:4646"
	rpc = "{{ GetPrivateIP }}:4647"
	serf = "{{ GetPrivateIP }}:4648"
}

server {
	enabled = true
	bootstrap_expect = ${instance_count}
}

consul {
	address = "127.0.0.1:8500"
	server_auto_join = true
	client_auto_join = true
	auto_advertise = true
}

vault {
	enabled = true
	address = "http://127.0.0.1:8200"
}

telemetry {
	prometheus_metrics = false
}