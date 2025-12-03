import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

export interface BackupMetadata {
	timestamp: string
}

const METADATA_FILE = '.backup_metadata';

export function getMetadataFilePath(backupDir: string): string {
	return path.join(backupDir, METADATA_FILE);
}

export function saveBackupMetadata(
	backupDir: string,
	backupType: string,
	timestamp: string,
): void {
	const metadataFile = getMetadataFilePath(backupDir);

	// Ensure backup directory exists
	if (!existsSync(backupDir)) {
		mkdirSync(backupDir, { recursive: true });
	}

	const metadata: Record<string, string> = {};

	// Load existing metadata if it exists
	if (existsSync(metadataFile)) {
		const content = readFileSync(metadataFile, 'utf-8');
		for (const line of content.split('\n')) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith('#')) continue;

			const match = trimmed.match(/^([^=]+)=(.*)$/);
			if (match) {
				const key = match[1].trim();
				const value = match[2].trim();
				metadata[key] = value;
			}
		}
	}

	// Update metadata for this backup type
	const metadataKey = `${backupType}_last_backup`;
	metadata[metadataKey] = timestamp;

	// Write back to file
	const lines: string[] = [];
	for (const [key, value] of Object.entries(metadata)) {
		lines.push(`${key}=${value}`);
	}
	writeFileSync(metadataFile, lines.join('\n') + '\n', 'utf-8');
}

export function loadBackupMetadata(backupDir: string, backupType: string): BackupMetadata | null {
	const metadataFile = getMetadataFilePath(backupDir);

	if (!existsSync(metadataFile)) {
		return null;
	}

	const content = readFileSync(metadataFile, 'utf-8');
	const metadataKey = `${backupType}_last_backup`;

	for (const line of content.split('\n')) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;

		if (trimmed.startsWith(`${metadataKey}=`)) {
			const timestamp = trimmed.substring(metadataKey.length + 1);
			return { timestamp };
		}
	}

	return null;
}
