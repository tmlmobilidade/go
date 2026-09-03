/* * */

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import unzipper from 'unzipper';

/**
 * Calculates a deterministic SHA-256 hash of the contents of a `.zip` file.
 * The hash is independent of `.zip` file metadata such as file modification timestamps,
 * compression settings, and `.zip` file entry ordering.
 * Files are hashed individually in streaming mode, then the filenames and
 * individual hashes are sorted and combined into the final hash.
 * @param zipFilePath The path to the `.zip` file.
 * @returns The SHA-256 hash of the `.zip` file contents.
 */
export async function calculateZipFileHash(filePath: string): Promise<string> {
	//

	//
	// Initialize the list of files to hash.

	const foundFiles: { hash: string, path: string }[] = [];

	//
	// Create a read stream for the zip file.

	const zipFileStream = fs
		.createReadStream(filePath)
		.pipe(unzipper.Parse());

	//
	// Parse the zip file and hash each entry.

	for await (const entry of zipFileStream) {
		// Skip directory entries (but still process files inside)
		if (entry.type === 'Directory') {
			entry.autodrain();
			continue;
		}
		// Stream the file contents and calculate the SHA-256 hash.
		const fileHash = createHash('sha256');
		for await (const chunk of entry) {
			fileHash.update(chunk);
		}
		// Add the file to the list of files to hash.
		foundFiles.push({ hash: fileHash.digest('hex'), path: entry.path });
	}

	//
	// Make the result independent of the order of entries in the zip file.

	foundFiles.sort((a, b) => a.path.localeCompare(b.path));

	//
	// Calculate the final hash by concatenating the sorted list
	// of filenames and individual file hashes.

	const finalHash = createHash('sha256');

	for (const file of foundFiles) {
		finalHash.update(file.path);
		finalHash.update('\0');
		finalHash.update(file.hash);
		finalHash.update('\0');
	}

	return finalHash.digest('hex');
}
