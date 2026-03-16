# Building custom images with Packer

Follow this guide to build custom VM images using Packer on OCI. You will need access to an OCI compartment and the OCI-CLI tool configured in your machine.

## What is Packer
Packer is a HashiCorp tool used for building automated machine images for multiple platforms from a single source configuration. Think Docker-style container images but for actual machines, where a full OS in required.

## Purpose
This directory contains Packer configurations for the infrastructure requirements of this project. This includes several custom images, each for its given purpose:

## Requirements
In order to use Packer you will need to have the OCI-CLI tool configured in your local machine. To do this follow these steps:
```
TBD
```


## Usage
Open a new terminal window and change the shell into this directory:
```
cd ./infra/database/mongodb/packer
```

Initialize the packer module and validate the configuration files:
```
packer init .
packer validate .
```

Then, start building the images:
```
packer build .
```
