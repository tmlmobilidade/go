/* * */

import { type ExportToHitouchConfig } from '@/types.js';
import fs from 'node:fs';
import path from 'node:path';
import { ZipFile } from 'yazl';

/* * */

/**
 * Creates the HiTouch ZIP archive with all TXT files at the archive root.
 */
export async function createHitouchZip(exportConfig: ExportToHitouchConfig): Promise<string> {
	//

	const outputPath = path.join(exportConfig.workdir, exportConfig.output);

	const textFiles = fs.readdirSync(exportConfig.workdir, { withFileTypes: true })
		.filter(entry => entry.isFile() && path.extname(entry.name).toLowerCase() === '.txt')
		.map(entry => entry.name)
		.sort();

	if (!textFiles.length) {
		throw new Error(`No TXT files found in ${exportConfig.workdir}.`);
	}

	const outputZip = new ZipFile();

	for (const fileName of textFiles) {
		outputZip.addFile(path.join(exportConfig.workdir, fileName), fileName);
	}

	await new Promise<void>((resolve, reject) => {
		const outputStream = fs.createWriteStream(outputPath);

		outputStream.on('close', resolve);
		outputStream.on('error', reject);
		outputZip.outputStream.on('error', reject);
		outputZip.outputStream.pipe(outputStream);
		outputZip.end();
	});

	return outputPath;
}
