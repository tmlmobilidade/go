# # #
# OCI AUTHENTICATION
# Copy this file to terraform.tfvars and fill in the values.
# Never commit terraform.tfvars to source control.

tenancy_ocid     = ""
user_ocid        = ""  # tiago.macedo user OCID
fingerprint      = ""
private_key_path = "~/.oci/oci_api_key.pem"

ssh_public_key_path  = "~/.ssh/id_rsa.pub"
ssh_private_key_path = "~/.ssh/id_rsa"  # Used by Packer only

# ClickHouse admin password (will be set as CLICKHOUSE_PASSWORD env var)
clickhouse_admin_password = ""


# -----------------------------------------------------------------------
# REQUIRED — Static private IPs for the 3 replica nodes
# IMPORTANT: Verify these IPs are free in your OCI subnet before applying.
# Check: OCI Console > Networking > Virtual Cloud Networks > pub-cmet subnet > IP Addresses
# -----------------------------------------------------------------------

private_ips = ["", "", ""]   # e.g. ["10.0.1.10", "10.0.1.11", "10.0.1.12"]


# -----------------------------------------------------------------------
# OPTIONAL OVERRIDES (uncomment to change defaults)
# -----------------------------------------------------------------------

# compartment_ocid    = ""
# availability_domain = "LUDo:EU-FRANKFURT-1-AD-1"
# region              = "eu-frankfurt-1"

# subnet_ocid         = ""   # defaults to pub-cmet
# packer_subnet_ocid  = ""   # defaults to pub-cmet

# instance_count      = 3
# vm_shape            = "VM.Standard.A1.Flex"
# vm_ocpus            = 2
# vm_memory_in_gbs    = 12
# boot_volume_size_in_gbs = 50
# data_volume_size_in_gbs = 1024

# clickhouse_http_port          = 8123
# clickhouse_tcp_port           = 9000
