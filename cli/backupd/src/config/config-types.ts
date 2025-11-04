import { BackupConfig } from '@/backup/backup.service.js';
import { MongoDbConfig } from '@/database/mongo.service.js';
import { PostgresConfig } from '@/database/postgres.service.js';
import { EmailConfig } from '@/mailer/mailer.service.js';
import { OCIStorageProviderConfiguration, S3StorageProviderConfiguration } from '@tmlmobilidade/go-interfaces';

export interface StorageConfig {
	aws_config?: S3StorageProviderConfiguration
	oci_config?: OCIStorageProviderConfiguration
	r2_config?: S3StorageProviderConfiguration & {
		endpoint: string
	}
	type: 'aws' | 'cloudflare' | 'oci'
}

export interface MongoDBOptions {
	connectTimeoutMS: number
	directConnection: boolean
	dump_options?: {
		exclude_collections?: string[]
	}
	maxPoolSize: number
	minPoolSize: number
	readPreference: string
	serverSelectionTimeoutMS: number
}

export interface DatabaseConfig {
	mongodb_config?: MongoDbConfig
	postgres_config?: PostgresConfig
	type: 'mongodb' | 'postgres'
}

export interface AppConfig {
	backup: BackupConfig
	database: DatabaseConfig
	email?: EmailConfig
	storage: StorageConfig
}
