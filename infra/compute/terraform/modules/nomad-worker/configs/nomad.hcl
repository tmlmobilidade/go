datacenter = "dc1"
data_dir   = "/opt/nomad/data"

bind_addr = "0.0.0.0"

advertise {
  http = "{{ GetPrivateIP }}:4646"
  rpc  = "{{ GetPrivateIP }}:4647"
  serf = "{{ GetPrivateIP }}:4648"
}

consul {
  address = "127.0.0.1:8500"
  token   = "CONSUL_NOMAD_TOKEN"
}


### FOR CLIENT

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