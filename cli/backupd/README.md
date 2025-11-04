## Overview

The service will run continuously, performing backups at the interval specified in the configuration file.

## Setup

This service uses a configuration file in YAML format. There is an example file in the repository (`config.example.yaml`).

In addition to the configuration file, this service uses the environment variable `BACKUPD_CONFIG_PATH` to locate the configuration file.

## Configuration File Template

The configuration file includes **storage**, **database**,**backup schedule**, and optional **email notification** settings. This file enables you to specify the exact setup for these operations.

### Structure of `config.yaml`

- **Storage Configuration**
- **Database Configuration**
- **Backup Configuration**
- **Email Configuration**

---

### Configuration Parameters

#### 1. Storage Configuration
Defines the storage service for backups.

```yaml
storage:
  type: STORAGE_TYPE
  aws_config:
    aws_access_key_id: YOUR_AWS_ACCESS_KEY_ID
    aws_secret_access_key: YOUR_AWS_SECRET_ACCESS_KEY
    bucket_name: YOUR_BUCKET_NAME
    region: YOUR_REGION
  oci_config:
    tenancy: YOUR_TENANCY
    user: YOUR_USER
    fingerprint: YOUR_FINGERPRINT
    private_key_path: YOUR_PRIVATE_KEY_PATH
```

- `type`: Set to `"aws"` for AWS S3 or `"oci"` for Oracle Cloud Storage.
- **AWS Config**: (Required if `type` is `"aws"`)
  - `aws_access_key_id`, `aws_secret_access_key`: AWS credentials.
  - `bucket_name`, `region`: Define the S3 bucket and region.
- **OCI Config**: (Required if `type` is `"oci"`)
  - `tenancy`, `user`, `fingerprint`, `private_key_path`: Required fields for Oracle Cloud access.

#### 2. Database Configuration
Specifies the database type and connection parameters.

```yaml
database:
  type: DATABASE_TYPE
  mongodb_config:
    uri: YOUR_MONGODB_URI
    options:
      connectTimeoutMS: 10000
      ...
  postgres_config:
    uri: YOUR_POSTGRES_URI
    options:
      max: 10
      min: 5
      ...
```

- `type`: Database service to use (`mongodb` or `postgres`).
- **MongoDB Config**: (Required if `type` is `"mongodb"`)
  - `uri`: MongoDB connection URI.
  - `options`: Optional connection parameters (timeout, pooling, and read preferences).
- **PostgreSQL Config**: (Required if `type` is `"postgres"`)
  - `uri`: PostgreSQL connection URI.
  - `options`: Pooling options.

#### 3. Backup Configuration
Manages backup intervals, destinations, and retention.

```yaml
backup:
  interval: 360
  destination: backup/PROJECT_NAME/
  max_remote_backups: 10
  max_local_backups: 10
```

- `interval`: Frequency of backups in minutes (e.g., `360` for every 6 hours).
- `destination`: Local directory path for storing backups.
- `max_remote_backups`: Set retention limits for remote backups. (If set to 0, there will be no limit stored in the remote storage.)
- `max_local_backups`: Set retention limits for local backups. (If set to 0, all local backups will be deleted.)

#### 4. Email Configuration (Optional)
Enables email notifications upon backup success or failure.

```yaml
email:
  send_success: true
  send_failure: true
  mail_options:
    from: FROM_EMAIL_ADDRESS
    to: TO_EMAIL_ADDRESS
    subject: BACKUP_REPORT_SUBJECT
  smtp:
    host: YOUR_SMTP_HOST
    port: YOUR_SMTP_PORT
    auth:
      user: YOUR_SMTP_USER
      pass: YOUR_SMTP_PASSWORD
```

- `send_success`, `send_failure`: Set to `true` to enable email notifications.
- `mail_options`: Sender and recipient details.
- `smtp`: SMTP server configuration for outgoing emails.

---

### Usage
1. Copy this template file as `config.yaml`.
2. Replace the placeholder values with your actual configurations.
3. Save and start the `backupd` service.

This file enables `backupd` to seamlessly back up and monitor your databases across different storage services.

