import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export interface MongoConfig {
	authDatabase?: string
	database?: string
	host?: string
	password?: string
	uri?: string
	username?: string
}

export interface FetchConfig {
	database: MongoConfig
	scriptDir: string
}

function parseEnvValue(value: string | undefined, defaultValue = ''): string {
	return value?.trim() || defaultValue;
}

export function loadConfig(): FetchConfig {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);
	const scriptDir = path.resolve(__dirname, '../..');
	const envFile = path.join(scriptDir, '.env');

	if (!existsSync(envFile)) {
		throw new Error(`Environment file not found at ${envFile}\nPlease create a .env file with DATABASE_URI or MongoDB connection parameters`);
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

	// Check if DATABASE_URI is provided (preferred method)
	const databaseUri = parseEnvValue(envVars.DATABASE_URI);

	if (databaseUri) {
		return {
			database: {
				uri: databaseUri,
			},
			scriptDir,
		};
	}

	// Otherwise, check for individual connection parameters
	const host = parseEnvValue(envVars.MONGO_HOST || envVars.HOST);
	const database = parseEnvValue(envVars.MONGO_DB || envVars.DATABASE || envVars.DB);
	const username = parseEnvValue(envVars.MONGO_USERNAME || envVars.USERNAME);
	const password = parseEnvValue(envVars.MONGO_PASSWORD || envVars.PASSWORD);
	const authDatabase = parseEnvValue(envVars.MONGO_AUTH_DATABASE || envVars.AUTH_DATABASE, 'admin');

	if (!host || !database) {
		throw new Error(`MongoDB configuration missing: DATABASE_URI or (MONGO_HOST and MONGO_DB) are required in ${envFile}`);
	}

	return {
		database: {
			authDatabase,
			database,
			host,
			password,
			username,
		},
		scriptDir,
	};
}
