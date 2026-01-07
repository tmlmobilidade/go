########################
# Common Variables
# Shared variables used across all components in the Nomad cluster.
# These provide consistency and reduce duplication.
########################

# -----------------------------------------------------
# OCI Authentication Variables
# These are required for the OCI provider configuration
# -----------------------------------------------------

variable "tenancy_ocid" {
  description = "The OCID of the OCI tenancy"
  type        = string
}

variable "user_ocid" {
  description = "The OCID of the OCI user for API authentication"
  type        = string
}

variable "fingerprint" {
  description = "Fingerprint of the API signing key"
  type        = string
}

variable "private_key_path" {
  description = "Path to the private key file for API authentication"
  type        = string
}

variable "region" {
  description = "OCI region where resources will be created (e.g., eu-frankfurt-1)"
  type        = string
}

# -----------------------------------------------------
# Common Infrastructure Variables
# These define the shared infrastructure components
# -----------------------------------------------------

variable "compartment_ocid" {
  description = "OCID of the compartment where resources will be created"
  type        = string
}

variable "subnet_ocid" {
  description = "OCID of the subnet for instance placement"
  type        = string
}

variable "availability_domain" {
  description = "Availability domain for resource placement"
  type        = string
}

# -----------------------------------------------------
# SSH Authentication
# -----------------------------------------------------

variable "ssh_authorized_keys_file" {
  description = "Path to the file containing SSH public keys for instance access"
  type        = string
  default     = "~/.ssh/id_rsa.pub"
}

variable "ssh_authorized_keys" {
  description = "SSH public keys content (alternative to file path)"
  type        = string
  default     = ""
}

# -----------------------------------------------------
# Network Configuration
# -----------------------------------------------------

variable "assign_public_ip" {
  description = "Whether to assign public IPs to instances"
  type        = bool
  default     = true
}

variable "nomad_cluster_cidr" {
  description = "CIDR block for Nomad cluster internal communication"
  type        = string
  default     = "10.0.1.0/24"
}

# -----------------------------------------------------
# Environment Configuration
# -----------------------------------------------------

variable "environment" {
  description = "Environment name (e.g., development, staging, production)"
  type        = string
  default     = "development"

  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be one of: development, staging, production."
  }
}

variable "project_name" {
  description = "Name of the project for resource naming and tagging"
  type        = string
  default     = "nomad-cluster"
}
