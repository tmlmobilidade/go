# Required from root
variable "compartment_ocid" { type = string }
variable "availability_domain" { type = string }
variable "subnet_ocid" { type = string }
variable "image_ocid" { type = string }
variable "ssh_authorized_keys" { type = string }
variable "instance_count" { type = number }

variable "autoscaling_cooldown_seconds" {
  description = "Cooldown period between autoscaling actions (in seconds)"
  type        = number
  default     = 300
}