For a nomad install script:

1. Install consul, nomad and vault

2. Setup the systemctl service daemons, as well as the .hcl config files for each service

3. Setup apt auto-update with unatended upgrades



----


oci session refresh --profile oci-tml-joao-earth



---

OK, so it seems the flow should be:

1. Get Packer to build two OS images in OCI:
	1.1. One image for server nodes (consult + nomad + vault)
	1.2. Another for worker nodes (consult + nomad)

2. Get Terraform to build two instance configurations based on the produced images:
	2.1. One for server nodes, with server image and minimum resources
	2.2. Another for worker nodes, with worker image and medium to large resources

	NOTES:
	- tag them properly to take advantage of CIDR or OCI dns
	- Setup minimal init scripts to place config files in the VMs (should this be done in the Packer step?)

3. Get Terraform to setup two instance pools based on the produced configurations:
	3.1. Server pool with 3 instances
	3.2. Worker pool with min number of instances

4. Get Terraform to build one autoscaling configuration to dynamically change count of worker instances based on CPU usage