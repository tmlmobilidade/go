import archiver from 'archiver';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import path from 'path';

import { logger } from './logger.js';

export interface ZipFile {
	content: Buffer | string
	name: string
}

export async function createZipFile(
	files: ZipFile[],
	outputDir: string,
	zipFileName: string,
): Promise<string> {
	if (!existsSync(outputDir)) {
		mkdirSync(outputDir, { recursive: true });
		logger.verbose(`Created output directory: ${outputDir}`);
	}

	const zipPath = path.join(outputDir, zipFileName);
	logger.verbose(`Creating zip file: ${zipPath}`);

	return new Promise((resolve, reject) => {
		const output = createWriteStream(zipPath);
		const archive = archiver('zip', {
			zlib: { level: 9 }, // Maximum compression
		});

		output.on('close', () => {
			logger.verbose(`Zip file created: ${zipPath} (${archive.pointer()} bytes)`);
			resolve(zipPath);
		});

		archive.on('error', (error) => {
			reject(new Error(`Failed to create zip file: ${error.message}`));
		});

		archive.pipe(output);

		// Add files to the archive
		for (const file of files) {
			archive.append(file.content, { name: file.name });
			logger.verbose(`Added file to zip: ${file.name}`);
		}

		archive.finalize();
	});
}
