variable "compartment_ocid" {
  type = string
}

variable "availability_domain" {
  type = string
}

variable "subnet_ocid" {
  type = string
}

variable "base_image_ocid" {
  type = string
  description = "Ubuntu 22.04 image OCID"
}

variable "image_name" {
  type    = string
  default = "ubuntu-nomad-base"
}