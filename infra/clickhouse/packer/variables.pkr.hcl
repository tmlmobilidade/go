# -----------------------------------------------------------------------
# PACKER VARIABLES
# Shared with Terraform — can be supplied via -var-file=../terraform/terraform.tfvars
# -----------------------------------------------------------------------

variable "tenancy_ocid" {
  type        = string
  description = "OCID of the OCI tenancy."
}

variable "user_ocid" {
  type        = string
  description = "OCID of the OCI user (e.g. tiago.macedo)."
}

variable "fingerprint" {
  type        = string
  description = "Fingerprint of the API signing key."
}

variable "private_key_path" {
  type        = string
  description = "File path to the OCI API private key."
}

variable "pass_phrase" {
  type        = string
  description = "Passphrase for the OCI API private key."
  sensitive   = true
  default     = ""
}

variable "region" {
  type        = string
  description = "OCI region to build the image in."
  default     = "eu-frankfurt-1"
}

variable "compartment_ocid" {
  type        = string
  description = "OCID of the compartment where the custom image will be stored."
  default     = "ocid1.compartment.oc1..aaaaaaaaqwnoahpbcxhsogpszdixlv4jnrnujst7qxyar6536oeptpwjtkna"
}

variable "availability_domain" {
  type        = string
  description = "Availability domain to run the temporary build instance in."
  default     = "LUDo:EU-FRANKFURT-1-AD-1"
}

variable "packer_subnet_ocid" {
  type        = string
  description = <<-EOT
  OCID of an existing subnet to launch the temporary Packer build instance in.
  Defaults to the shared pub-cmet subnet.
  EOT
  default     = "ocid1.subnet.oc1.eu-frankfurt-1.aaaaaaaa4vbr4wpapm3wpa4o73yqytsyqedinrxouelf7ntkefdfuogof6rq"
}

variable "base_image_ocid" {
  type        = string
  description = "OCID of the base Ubuntu 22.04 Minimal ARM image to build from."
  # Canonical-Ubuntu-22.04-Minimal-aarch64-2026.01.29-0 in eu-frankfurt-1
  default = "ocid1.image.oc1.eu-frankfurt-1.aaaaaaaaehm3rohfjplxw73gzlyhp4gy2xtym33utccjawp3b5hivi7tbvlq"
}

variable "ssh_public_key_path" {
  type        = string
  description = "File path to the SSH public key. Injected into the OCI build instance via metadata."
}

variable "ssh_private_key_path" {
  type        = string
  description = "File path to the SSH private key. Used by Packer to connect to the build instance."
}
