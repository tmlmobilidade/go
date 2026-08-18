import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { type GtfsValidation } from '@tmlmobilidade/go-types-operation';
import { Logger } from '@tmlmobilidade/logger';
import fs from 'node:fs';

/**
 * Downloads the validation record's source archive into its local workspace.
 * @param gtfsValidation - The validation record.
 * @param gtfsFilePath - Path to the local workspace directory.
 */
export async function downloadGtfs(gtfsValidation: GtfsValidation, gtfsFilePath: string) {
	Logger.info({ message: 'Downloading GTFS file...' });

	// Resolve the storage metadata first because validation records retain only
	// the file identifier, not the provider URL.
	const gtfsFile = await storageProvider.findById(gtfsValidation.file_id);
	if (!gtfsFile) throw new Error(`File not found: ${gtfsValidation.file_id}`);

	const fileBuffer = await fetch(gtfsFile.url).then(res => res.arrayBuffer());

	fs.writeFileSync(gtfsFilePath, Buffer.from(fileBuffer));
}
