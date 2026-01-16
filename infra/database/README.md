# Infrastructure

This folder contains any files needed to setup the infrastructure for our backend services.

## Cloud Init

The `cloud-init.yaml` file is used to configure the VM when it is first booted. It is responsible for installing docker and any other dependencies needed.

This file is to be used in Cloud Providers console when creating a new VM.

## Services Setup

### 1. Run the `init.sh` script

To setup the infrastructure, you need to run the `init.sh` script. This script will create the necessary resources and configurations.

```bash
sh ./init.sh
```

This script will create the following resources:

- A docker compose file for that includes a mongoDB database and a backupd service that will backup the database to an S3-compatible object storage.

- 3 users with the necessary permissions to access the database.
  - `admin`: Has full access to the database.
  - `read`: Has read-only access to the database.
  - `write`: Has read-write access to the database.

### 2. Setup the `backupd` service

To setup the `backupd` service, to create a `backupd.yaml` file in the **same folder as the docker compose file**, based on `backupd.example.yaml`.

See the [Backupd](https://github.com/tmlmobilidade/core/blob/production/configs/backupd/README.md) for more information.

### 3. Run the docker compose file

Finally, run the docker compose file to start the services.

```bash
docker compose up -d
```

### To generate a new keyfile

`openssl rand -base64 756 > apex-t11-keyfile.key`