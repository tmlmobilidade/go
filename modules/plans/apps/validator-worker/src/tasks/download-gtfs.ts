import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { type GtfsValidation } from '@tmlmobilidade/go-types-operation';
import { Logger } from '@tmlmobilidade/logger';
import fs from 'node:fs';

export async function downloadGtfs(gtfsValidation: GtfsValidation, gtfsFilePath: string) {
	Logger.info({ message: 'Downloading GTFS file...' });

	const gtfsFile = await storageProvider.findById(gtfsValidation.file_id);
	if (!gtfsFile) throw new Error(`File not found: ${gtfsValidation.file_id}`);

	const fileBuffer = await fetch(gtfsFile.url).then(res => res.arrayBuffer());

	fs.writeFileSync(gtfsFilePath, Buffer.from(fileBuffer));
}
