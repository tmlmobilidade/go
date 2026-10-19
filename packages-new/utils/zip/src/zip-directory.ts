/* * */

import fs from 'node:fs';
import path from 'node:path';
import { ZipFile } from 'yazl';

/**
 * Zips a directory into a zip file using Yazl.
 * @param inputDir The path to the directory to zip.
 * @param outputZipFilePath The path to the zip file to create.
 * @returns A promise that resolves when the directory is zipped.
 */
export async function zipDirectory(inputDir: string, outputZipFilePath: string) {
	//

	//
	// Check if the input directory exists

	if (!fs.existsSync(inputDir)) throw new Error(`Input directory ${inputDir} does not exist`);

	//
	// Setup a new instance of Yazl and include all files in the input directory

	const outputZip = new ZipFile();

	await new Promise<void>((resolve, reject) => {
		try {
			//

			//
			// Read the working directory contents and filter
			// to keep only files. Throw an error if there are no files,
			// as it would produce an invalid zip file.

			const inputDirContents = fs.readdirSync(inputDir, { withFileTypes: true });

			const inputDirFiles = inputDirContents.filter(file => file.isFile());

			if (!inputDirFiles.length) throw new Error('No files found in input directory');

			//
			// Add each file to the zip

			for (const inputDirFile of inputDirFiles) {
				const filePath = path.join(inputDir, inputDirFile.name);
				outputZip.addFile(filePath, inputDirFile.name, { compress: true });
			}

			//
			// Setup a write stream to the final zip file

			outputZip.outputStream
				.pipe(fs.createWriteStream(outputZipFilePath))
				.on('close', resolve);

			//
			// Finalize the zip creation, which triggers
			// the piping and writing process.

			outputZip.end();

			//
		} catch (error) {
			reject(error);
		}
	});
}
