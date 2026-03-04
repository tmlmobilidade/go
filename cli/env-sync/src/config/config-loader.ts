import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export interface MongoConfig {
	authDatabase: string
	database: string
	host: string
	password: string
	username: string
}

export interface StorageConfig {
	compartment: string
	dest: string
	fingerprint: string
	keyFile: string
	namespace: string
	region: string
	remoteName: string
	source: string
	tenancy: string
	type: string
	user: string
}

export interface ArtifactsConfig {
	/** OCI bucket name for storing artifacts */
	bucket: string
	/** Optional prefix/folder within the bucket */
	prefix: string
}

export interface SyncConfig {
	artifacts: ArtifactsConfig
	backupDir: string
	backupRetentionDays: number
	databaseProduction: MongoConfig
	databaseStaging: MongoConfig
	excludeCollections: string[]
	scriptDir: string
	storage: StorageConfig
}

function parseEnvValue(value: string | undefined, defaultValue = ''): string {
	return value?.trim() || defaultValue;
}

function parseEnvNumber(value: string | undefined, defaultValue: number): number {
	if (!value) return defaultValue;
	const parsed = parseInt(value.trim(), 10);
	return isNaN(parsed) ? defaultValue : parsed;
}

export function loadConfig(envFilePath?: string): SyncConfig {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);
	const scriptDir = path.resolve(__dirname, '../..');
	const envFile = envFilePath
		? (path.isAbsolute(envFilePath) ? envFilePath : path.resolve(process.cwd(), envFilePath))
		: path.join(scriptDir, '.env');

	if (!existsSync(envFile)) {
		throw new Error(`Environment file not found at ${envFile}\nPlease copy env.example to .env and configure it`);
	}

	// Load .env file manually (dotenv doesn't work well with ESM in this context)
	const envContent = readFileSync(envFile, 'utf-8');
	const envVars: Record<string, string> = {};

	for (const line of envContent.split('\n')) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;

		const match = trimmed.match(/^([^=]+)=(.*)$/);
		if (match) {
			const key = match[1].trim();
			const value = match[2].trim().replace(/^["']|["']$/g, '');
			envVars[key] = value;
		}
	}

	// Validate required MongoDB variables
	const requiredMongoVars = ['PROD_HOST', 'STAGING_HOST'];
	for (const varName of requiredMongoVars) {
		if (!envVars[varName]) {
			throw new Error(`MongoDB configuration missing: ${varName} is required in ${envFile}`);
		}
	}

	// Validate required Storage variables
	const requiredStorageVars = ['STORAGE_SOURCE', 'STORAGE_DEST', 'STORAGE_REMOTE_NAME', 'STORAGE_TYPE', 'OCI_COMPARTMENT', 'OCI_FINGERPRINT', 'OCI_KEY_FILE', 'OCI_NAMESPACE', 'OCI_REGION', 'OCI_TENANCY', 'OCI_USER'];
	for (const varName of requiredStorageVars) {
		if (!envVars[varName]) {
			throw new Error(`Storage configuration missing: ${varName} is required in ${envFile}`);
		}
	}

	const backupDir = path.join(scriptDir, 'backups');

	return {
		artifacts: {
			bucket: parseEnvValue(envVars.ARTIFACTS_BUCKET, ''),
			prefix: parseEnvValue(envVars.ARTIFACTS_PREFIX, ''),
		},
		backupDir,
		backupRetentionDays: parseEnvNumber(envVars.BACKUP_RETENTION_DAYS, 7),
		databaseProduction: {
			authDatabase: parseEnvValue(envVars.PROD_AUTH_DATABASE, 'admin'),
			database: parseEnvValue(envVars.PROD_DB),
			host: parseEnvValue(envVars.PROD_HOST),
			password: parseEnvValue(envVars.PROD_PASSWORD),
			username: parseEnvValue(envVars.PROD_USERNAME),
		},
		databaseStaging: {
			authDatabase: parseEnvValue(envVars.STAGING_AUTH_DATABASE, 'admin'),
			database: parseEnvValue(envVars.STAGING_DB),
			host: parseEnvValue(envVars.STAGING_HOST),
			password: parseEnvValue(envVars.STAGING_PASSWORD),
			username: parseEnvValue(envVars.STAGING_USERNAME),
		},
		excludeCollections: parseEnvValue(envVars.EXCLUDE_COLLECTIONS, '')
			.split(/\s+/)
			.filter(c => c.length > 0),
		scriptDir,
		storage: {
			//
			dest: parseEnvValue(envVars.STORAGE_DEST),
			remoteName: parseEnvValue(envVars.STORAGE_REMOTE_NAME),
			source: parseEnvValue(envVars.STORAGE_SOURCE),
			type: parseEnvValue(envVars.STORAGE_TYPE),
			//
			compartment: parseEnvValue(envVars.OCI_COMPARTMENT),
			fingerprint: parseEnvValue(envVars.OCI_FINGERPRINT),
			keyFile: parseEnvValue(envVars.OCI_KEY_FILE),
			namespace: parseEnvValue(envVars.OCI_NAMESPACE),
			region: parseEnvValue(envVars.OCI_REGION),
			tenancy: parseEnvValue(envVars.OCI_TENANCY),
			user: parseEnvValue(envVars.OCI_USER),
		},
	};
}
